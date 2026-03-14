from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_connection
from utils.ref import generate_ref

adjustments_bp = Blueprint('adjustments', __name__)


def _serialize(r, lines=None):
    obj = {
        'id':             r['id'],
        'ref':            r['ref'],
        'location_id':    r['location_id'],
        'location_name':  r.get('location_name'),
        'warehouse_name': r.get('warehouse_name'),
        'status':         r['status'],
        'notes':          r['notes'],
        'created_by':     r['created_by'],
        'validated_at':   r['validated_at'].isoformat() if r.get('validated_at') else None,
        'created_at':     r['created_at'].isoformat() if r.get('created_at') else None,
    }
    if lines is not None:
        obj['lines'] = lines
    return obj


def _fetch_one(cur, adj_id):
    cur.execute('''
        SELECT a.*, l.name AS location_name, w.name AS warehouse_name
        FROM adjustments a
        LEFT JOIN locations l  ON l.id = a.location_id
        LEFT JOIN warehouses w ON w.id = l.warehouse_id
        WHERE a.id = %s
    ''', (adj_id,))
    return cur.fetchone()


def _fetch_lines(cur, adj_id):
    cur.execute('''
        SELECT al.id, al.product_id, p.name AS product_name, p.sku,
               p.unit_of_measure, al.qty_system, al.qty_counted
        FROM adjustment_lines al
        JOIN products p ON p.id = al.product_id
        WHERE al.adjustment_id = %s
        ORDER BY al.id
    ''', (adj_id,))
    return [dict(row) for row in cur.fetchall()]


@adjustments_bp.route('', methods=['GET'])
@jwt_required()
def list_adjustments():
    status = request.args.get('status', '')
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            sql = '''
                SELECT a.*, l.name AS location_name, w.name AS warehouse_name,
                       COUNT(al.id) AS line_count
                FROM adjustments a
                LEFT JOIN locations l  ON l.id = a.location_id
                LEFT JOIN warehouses w ON w.id = l.warehouse_id
                LEFT JOIN adjustment_lines al ON al.adjustment_id = a.id
                WHERE 1=1
            '''
            params = []
            if status:
                sql += ' AND a.status = %s'
                params.append(status)
            sql += ' GROUP BY a.id ORDER BY a.created_at DESC'
            cur.execute(sql, params)
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify([{**_serialize(r), 'line_count': r['line_count']} for r in rows])


@adjustments_bp.route('', methods=['POST'])
@jwt_required()
def create_adjustment():
    data        = request.get_json() or {}
    user_id     = get_jwt_identity()
    location_id = data.get('location_id')
    notes       = (data.get('notes') or '').strip() or None
    lines_data  = data.get('lines', [])

    if not location_id:
        return jsonify({'error': 'location_id is required'}), 400

    ref = generate_ref('ADJ')
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO adjustments (ref, location_id, notes, created_by) VALUES (%s,%s,%s,%s)',
                (ref, location_id, notes, user_id)
            )
            adj_id = cur.lastrowid

            for line in lines_data:
                pid = line['product_id']
                # Get current system qty
                cur.execute(
                    'SELECT COALESCE(qty,0) AS qty FROM stock_levels WHERE product_id=%s AND location_id=%s',
                    (pid, location_id)
                )
                sl = cur.fetchone()
                qty_system = int(sl['qty']) if sl else 0
                cur.execute(
                    'INSERT INTO adjustment_lines (adjustment_id, product_id, qty_system, qty_counted) VALUES (%s,%s,%s,%s)',
                    (adj_id, pid, qty_system, int(line.get('qty_counted', qty_system)))
                )
            conn.commit()
            row   = _fetch_one(cur, adj_id)
            lines = _fetch_lines(cur, adj_id)
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(_serialize(row, lines)), 201


@adjustments_bp.route('/<int:adj_id>', methods=['GET'])
@jwt_required()
def get_adjustment(adj_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            row = _fetch_one(cur, adj_id)
            if not row:
                return jsonify({'error': 'Adjustment not found'}), 404
            lines = _fetch_lines(cur, adj_id)
    finally:
        conn.close()
    return jsonify(_serialize(row, lines))


@adjustments_bp.route('/<int:adj_id>', methods=['PUT'])
@jwt_required()
def update_adjustment(adj_id):
    data = request.get_json() or {}
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            row = _fetch_one(cur, adj_id)
            if not row:
                return jsonify({'error': 'Adjustment not found'}), 404
            if row['status'] == 'done':
                return jsonify({'error': 'Cannot edit a validated adjustment'}), 400

            fields, params = [], []
            for col in ('location_id', 'notes', 'status'):
                if col in data:
                    fields.append(f'{col} = %s')
                    params.append(data[col])
            if fields:
                params.append(adj_id)
                cur.execute(f"UPDATE adjustments SET {', '.join(fields)} WHERE id = %s", params)

            if 'lines' in data:
                location_id = data.get('location_id') or row['location_id']
                cur.execute('DELETE FROM adjustment_lines WHERE adjustment_id = %s', (adj_id,))
                for line in data['lines']:
                    pid = line['product_id']
                    cur.execute(
                        'SELECT COALESCE(qty,0) AS qty FROM stock_levels WHERE product_id=%s AND location_id=%s',
                        (pid, location_id)
                    )
                    sl = cur.fetchone()
                    qty_system = int(sl['qty']) if sl else 0
                    cur.execute(
                        'INSERT INTO adjustment_lines (adjustment_id, product_id, qty_system, qty_counted) VALUES (%s,%s,%s,%s)',
                        (adj_id, pid, qty_system, int(line.get('qty_counted', qty_system)))
                    )
            conn.commit()
            row   = _fetch_one(cur, adj_id)
            lines = _fetch_lines(cur, adj_id)
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(_serialize(row, lines))


@adjustments_bp.route('/<int:adj_id>', methods=['DELETE'])
@jwt_required()
def delete_adjustment(adj_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT status FROM adjustments WHERE id = %s', (adj_id,))
            row = cur.fetchone()
            if not row:
                return jsonify({'error': 'Adjustment not found'}), 404
            if row['status'] == 'done':
                return jsonify({'error': 'Cannot delete a validated adjustment'}), 400
            cur.execute('DELETE FROM adjustments WHERE id = %s', (adj_id,))
            conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'message': 'Adjustment deleted'})


@adjustments_bp.route('/<int:adj_id>/validate', methods=['POST'])
@jwt_required()
def validate_adjustment(adj_id):
    user_id = get_jwt_identity()
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            row = _fetch_one(cur, adj_id)
            if not row:
                return jsonify({'error': 'Adjustment not found'}), 404
            if row['status'] != 'ready':
                return jsonify({'error': 'Adjustment must be in Ready status to validate'}), 400

            lines       = _fetch_lines(cur, adj_id)
            location_id = row['location_id']

            for line in lines:
                qty_counted = int(line['qty_counted'])
                qty_system  = int(line['qty_system'])
                diff        = qty_counted - qty_system
                product_id  = line['product_id']

                # Set stock to counted value
                cur.execute('''
                    INSERT INTO stock_levels (product_id, location_id, qty)
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE qty = %s
                ''', (product_id, location_id, qty_counted, qty_counted))

                # Ledger entry (diff can be negative)
                cur.execute('''
                    INSERT INTO stock_ledger
                      (product_id, from_location_id, to_location_id, qty_change,
                       operation_type, reference_id, reference_type, created_by)
                    VALUES (%s, %s, %s, %s, 'adjustment', %s, 'adjustment', %s)
                ''', (
                    product_id,
                    location_id if diff < 0 else None,
                    location_id if diff >= 0 else None,
                    diff,
                    adj_id,
                    user_id
                ))

            cur.execute(
                "UPDATE adjustments SET status='done', validated_at=NOW() WHERE id=%s",
                (adj_id,)
            )
            conn.commit()
            row   = _fetch_one(cur, adj_id)
            lines = _fetch_lines(cur, adj_id)
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(_serialize(row, lines))
