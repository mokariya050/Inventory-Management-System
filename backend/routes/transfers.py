from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_connection
from utils.ref import generate_ref

transfers_bp = Blueprint('transfers', __name__)


def _serialize(r, lines=None):
    obj = {
        'id':                r['id'],
        'ref':               r['ref'],
        'from_location_id':  r['from_location_id'],
        'from_location':     r.get('from_location'),
        'from_warehouse':    r.get('from_warehouse'),
        'to_location_id':    r['to_location_id'],
        'to_location':       r.get('to_location'),
        'to_warehouse':      r.get('to_warehouse'),
        'status':            r['status'],
        'notes':             r['notes'],
        'created_by':        r['created_by'],
        'validated_at':      r['validated_at'].isoformat() if r.get('validated_at') else None,
        'created_at':        r['created_at'].isoformat() if r.get('created_at') else None,
    }
    if lines is not None:
        obj['lines'] = lines
    return obj


def _fetch_one(cur, transfer_id):
    cur.execute('''
        SELECT t.*,
               fl.name AS from_location, fw.name AS from_warehouse,
               tl.name AS to_location,   tw.name AS to_warehouse
        FROM transfers t
        LEFT JOIN locations fl ON fl.id = t.from_location_id
        LEFT JOIN warehouses fw ON fw.id = fl.warehouse_id
        LEFT JOIN locations tl ON tl.id = t.to_location_id
        LEFT JOIN warehouses tw ON tw.id = tl.warehouse_id
        WHERE t.id = %s
    ''', (transfer_id,))
    return cur.fetchone()


def _fetch_lines(cur, transfer_id):
    cur.execute('''
        SELECT tl.id, tl.product_id, p.name AS product_name, p.sku,
               p.unit_of_measure, tl.qty
        FROM transfer_lines tl
        JOIN products p ON p.id = tl.product_id
        WHERE tl.transfer_id = %s
        ORDER BY tl.id
    ''', (transfer_id,))
    return [dict(row) for row in cur.fetchall()]


@transfers_bp.route('', methods=['GET'])
@jwt_required()
def list_transfers():
    status = request.args.get('status', '')
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            sql = '''
                SELECT t.*,
                       fl.name AS from_location, fw.name AS from_warehouse,
                       tl.name AS to_location,   tw.name AS to_warehouse,
                       COUNT(tl2.id) AS line_count
                FROM transfers t
                LEFT JOIN locations fl  ON fl.id = t.from_location_id
                LEFT JOIN warehouses fw ON fw.id = fl.warehouse_id
                LEFT JOIN locations tl  ON tl.id = t.to_location_id
                LEFT JOIN warehouses tw ON tw.id = tl.warehouse_id
                LEFT JOIN transfer_lines tl2 ON tl2.transfer_id = t.id
                WHERE 1=1
            '''
            params = []
            if status:
                sql += ' AND t.status = %s'
                params.append(status)
            sql += ' GROUP BY t.id ORDER BY t.created_at DESC'
            cur.execute(sql, params)
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify([{**_serialize(r), 'line_count': r['line_count']} for r in rows])


@transfers_bp.route('', methods=['POST'])
@jwt_required()
def create_transfer():
    data             = request.get_json() or {}
    user_id          = get_jwt_identity()
    from_location_id = data.get('from_location_id')
    to_location_id   = data.get('to_location_id')
    notes            = (data.get('notes') or '').strip() or None
    lines_data       = data.get('lines', [])

    if not from_location_id or not to_location_id:
        return jsonify({'error': 'from_location_id and to_location_id are required'}), 400
    if from_location_id == to_location_id:
        return jsonify({'error': 'Source and destination locations must be different'}), 400

    ref = generate_ref('TRF')
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO transfers (ref, from_location_id, to_location_id, notes, created_by) VALUES (%s,%s,%s,%s,%s)',
                (ref, from_location_id, to_location_id, notes, user_id)
            )
            transfer_id = cur.lastrowid
            for line in lines_data:
                cur.execute(
                    'INSERT INTO transfer_lines (transfer_id, product_id, qty) VALUES (%s,%s,%s)',
                    (transfer_id, line['product_id'], int(line.get('qty', 0)))
                )
            conn.commit()
            row   = _fetch_one(cur, transfer_id)
            lines = _fetch_lines(cur, transfer_id)
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(_serialize(row, lines)), 201


@transfers_bp.route('/<int:transfer_id>', methods=['GET'])
@jwt_required()
def get_transfer(transfer_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            row = _fetch_one(cur, transfer_id)
            if not row:
                return jsonify({'error': 'Transfer not found'}), 404
            lines = _fetch_lines(cur, transfer_id)
    finally:
        conn.close()
    return jsonify(_serialize(row, lines))


@transfers_bp.route('/<int:transfer_id>', methods=['PUT'])
@jwt_required()
def update_transfer(transfer_id):
    data = request.get_json() or {}
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            row = _fetch_one(cur, transfer_id)
            if not row:
                return jsonify({'error': 'Transfer not found'}), 404
            if row['status'] == 'done':
                return jsonify({'error': 'Cannot edit a validated transfer'}), 400

            fields, params = [], []
            for col in ('from_location_id', 'to_location_id', 'notes', 'status'):
                if col in data:
                    fields.append(f'{col} = %s')
                    params.append(data[col])
            if fields:
                params.append(transfer_id)
                cur.execute(f"UPDATE transfers SET {', '.join(fields)} WHERE id = %s", params)

            if 'lines' in data:
                cur.execute('DELETE FROM transfer_lines WHERE transfer_id = %s', (transfer_id,))
                for line in data['lines']:
                    cur.execute(
                        'INSERT INTO transfer_lines (transfer_id, product_id, qty) VALUES (%s,%s,%s)',
                        (transfer_id, line['product_id'], int(line.get('qty', 0)))
                    )
            conn.commit()
            row   = _fetch_one(cur, transfer_id)
            lines = _fetch_lines(cur, transfer_id)
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(_serialize(row, lines))


@transfers_bp.route('/<int:transfer_id>', methods=['DELETE'])
@jwt_required()
def delete_transfer(transfer_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT status FROM transfers WHERE id = %s', (transfer_id,))
            row = cur.fetchone()
            if not row:
                return jsonify({'error': 'Transfer not found'}), 404
            if row['status'] == 'done':
                return jsonify({'error': 'Cannot delete a validated transfer'}), 400
            cur.execute('DELETE FROM transfers WHERE id = %s', (transfer_id,))
            conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'message': 'Transfer deleted'})


@transfers_bp.route('/<int:transfer_id>/validate', methods=['POST'])
@jwt_required()
def validate_transfer(transfer_id):
    user_id = get_jwt_identity()
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            row = _fetch_one(cur, transfer_id)
            if not row:
                return jsonify({'error': 'Transfer not found'}), 404
            if row['status'] != 'ready':
                return jsonify({'error': 'Transfer must be in Ready status to validate'}), 400

            lines            = _fetch_lines(cur, transfer_id)
            from_location_id = row['from_location_id']
            to_location_id   = row['to_location_id']

            # Check sufficient stock first
            for line in lines:
                qty = int(line['qty'])
                if qty <= 0:
                    continue
                product_id = line['product_id']
                cur.execute(
                    'SELECT COALESCE(qty,0) AS qty FROM stock_levels WHERE product_id=%s AND location_id=%s',
                    (product_id, from_location_id)
                )
                sl = cur.fetchone()
                available = int(sl['qty']) if sl else 0
                if available < qty:
                    return jsonify({
                        'error': f"Insufficient stock for '{line['product_name']}': "
                                 f"available {available}, requested {qty}"
                    }), 400

            for line in lines:
                qty = int(line['qty'])
                if qty <= 0:
                    continue
                product_id = line['product_id']

                # Decrease from source
                cur.execute(
                    'UPDATE stock_levels SET qty = qty - %s WHERE product_id=%s AND location_id=%s',
                    (qty, product_id, from_location_id)
                )
                # Increase at destination
                cur.execute('''
                    INSERT INTO stock_levels (product_id, location_id, qty)
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE qty = qty + %s
                ''', (product_id, to_location_id, qty, qty))

                # Ledger entry
                cur.execute('''
                    INSERT INTO stock_ledger
                      (product_id, from_location_id, to_location_id, qty_change,
                       operation_type, reference_id, reference_type, created_by)
                    VALUES (%s, %s, %s, %s, 'transfer', %s, 'transfer', %s)
                ''', (product_id, from_location_id, to_location_id, qty, transfer_id, user_id))

            cur.execute(
                "UPDATE transfers SET status='done', validated_at=NOW() WHERE id=%s",
                (transfer_id,)
            )
            conn.commit()
            row   = _fetch_one(cur, transfer_id)
            lines = _fetch_lines(cur, transfer_id)
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(_serialize(row, lines))
