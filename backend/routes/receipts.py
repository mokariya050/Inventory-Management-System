from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_connection
from utils.ref import generate_ref

receipts_bp = Blueprint('receipts', __name__)


def _serialize(r, lines=None):
    obj = {
        'id':           r['id'],
        'ref':          r['ref'],
        'supplier_id':  r['supplier_id'],
        'supplier_name': r.get('supplier_name'),
        'location_id':  r['location_id'],
        'location_name': r.get('location_name'),
        'warehouse_name': r.get('warehouse_name'),
        'status':       r['status'],
        'notes':        r['notes'],
        'created_by':   r['created_by'],
        'validated_at': r['validated_at'].isoformat() if r.get('validated_at') else None,
        'created_at':   r['created_at'].isoformat() if r.get('created_at') else None,
    }
    if lines is not None:
        obj['lines'] = lines
    return obj


def _fetch_one(cur, receipt_id):
    cur.execute('''
        SELECT r.*, s.name AS supplier_name,
               l.name AS location_name, w.name AS warehouse_name
        FROM receipts r
        LEFT JOIN suppliers s  ON s.id = r.supplier_id
        LEFT JOIN locations l  ON l.id = r.location_id
        LEFT JOIN warehouses w ON w.id = l.warehouse_id
        WHERE r.id = %s
    ''', (receipt_id,))
    return cur.fetchone()


def _fetch_lines(cur, receipt_id):
    cur.execute('''
        SELECT rl.id, rl.product_id, p.name AS product_name, p.sku,
               p.unit_of_measure, rl.qty_expected, rl.qty_done
        FROM receipt_lines rl
        JOIN products p ON p.id = rl.product_id
        WHERE rl.receipt_id = %s
        ORDER BY rl.id
    ''', (receipt_id,))
    return [dict(row) for row in cur.fetchall()]


@receipts_bp.route('', methods=['GET'])
@jwt_required()
def list_receipts():
    status = request.args.get('status', '')
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            sql = '''
                SELECT r.*, s.name AS supplier_name,
                       l.name AS location_name, w.name AS warehouse_name,
                       COUNT(rl.id) AS line_count
                FROM receipts r
                LEFT JOIN suppliers s  ON s.id = r.supplier_id
                LEFT JOIN locations l  ON l.id = r.location_id
                LEFT JOIN warehouses w ON w.id = l.warehouse_id
                LEFT JOIN receipt_lines rl ON rl.receipt_id = r.id
                WHERE 1=1
            '''
            params = []
            if status:
                sql += ' AND r.status = %s'
                params.append(status)
            sql += ' GROUP BY r.id ORDER BY r.created_at DESC'
            cur.execute(sql, params)
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify([{**_serialize(r), 'line_count': r['line_count']} for r in rows])


@receipts_bp.route('', methods=['POST'])
@jwt_required()
def create_receipt():
    data        = request.get_json() or {}
    user_id     = get_jwt_identity()
    supplier_id = data.get('supplier_id') or None
    location_id = data.get('location_id')
    notes       = (data.get('notes') or '').strip() or None
    lines_data  = data.get('lines', [])

    if not location_id:
        return jsonify({'error': 'location_id is required'}), 400

    ref = generate_ref('REC')
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO receipts (ref, supplier_id, location_id, notes, created_by) VALUES (%s,%s,%s,%s,%s)',
                (ref, supplier_id, location_id, notes, user_id)
            )
            receipt_id = cur.lastrowid
            for line in lines_data:
                cur.execute(
                    'INSERT INTO receipt_lines (receipt_id, product_id, qty_expected, qty_done) VALUES (%s,%s,%s,%s)',
                    (receipt_id, line['product_id'], int(line.get('qty_expected', 0)), int(line.get('qty_done', 0)))
                )
            conn.commit()
            row   = _fetch_one(cur, receipt_id)
            lines = _fetch_lines(cur, receipt_id)
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(_serialize(row, lines)), 201


@receipts_bp.route('/<int:receipt_id>', methods=['GET'])
@jwt_required()
def get_receipt(receipt_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            row = _fetch_one(cur, receipt_id)
            if not row:
                return jsonify({'error': 'Receipt not found'}), 404
            lines = _fetch_lines(cur, receipt_id)
    finally:
        conn.close()
    return jsonify(_serialize(row, lines))


@receipts_bp.route('/<int:receipt_id>', methods=['PUT'])
@jwt_required()
def update_receipt(receipt_id):
    data = request.get_json() or {}
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            row = _fetch_one(cur, receipt_id)
            if not row:
                return jsonify({'error': 'Receipt not found'}), 404
            if row['status'] == 'done':
                return jsonify({'error': 'Cannot edit a validated receipt'}), 400

            fields, params = [], []
            for col in ('supplier_id', 'location_id', 'notes', 'status'):
                if col in data:
                    fields.append(f'{col} = %s')
                    params.append(data[col] or None if col in ('supplier_id',) else data[col])
            if fields:
                params.append(receipt_id)
                cur.execute(f"UPDATE receipts SET {', '.join(fields)} WHERE id = %s", params)

            if 'lines' in data:
                cur.execute('DELETE FROM receipt_lines WHERE receipt_id = %s', (receipt_id,))
                for line in data['lines']:
                    cur.execute(
                        'INSERT INTO receipt_lines (receipt_id, product_id, qty_expected, qty_done) VALUES (%s,%s,%s,%s)',
                        (receipt_id, line['product_id'], int(line.get('qty_expected', 0)), int(line.get('qty_done', 0)))
                    )
            conn.commit()
            row   = _fetch_one(cur, receipt_id)
            lines = _fetch_lines(cur, receipt_id)
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(_serialize(row, lines))


@receipts_bp.route('/<int:receipt_id>', methods=['DELETE'])
@jwt_required()
def delete_receipt(receipt_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT status FROM receipts WHERE id = %s', (receipt_id,))
            row = cur.fetchone()
            if not row:
                return jsonify({'error': 'Receipt not found'}), 404
            if row['status'] == 'done':
                return jsonify({'error': 'Cannot delete a validated receipt'}), 400
            cur.execute('DELETE FROM receipts WHERE id = %s', (receipt_id,))
            conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'message': 'Receipt deleted'})


@receipts_bp.route('/<int:receipt_id>/validate', methods=['POST'])
@jwt_required()
def validate_receipt(receipt_id):
    user_id = get_jwt_identity()
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            row = _fetch_one(cur, receipt_id)
            if not row:
                return jsonify({'error': 'Receipt not found'}), 404
            if row['status'] != 'ready':
                return jsonify({'error': 'Receipt must be in Ready status to validate'}), 400

            lines = _fetch_lines(cur, receipt_id)
            location_id = row['location_id']

            for line in lines:
                qty = int(line['qty_done'])
                if qty <= 0:
                    continue
                product_id = line['product_id']

                # Upsert stock_levels
                cur.execute('''
                    INSERT INTO stock_levels (product_id, location_id, qty)
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE qty = qty + %s
                ''', (product_id, location_id, qty, qty))

                # Ledger entry
                cur.execute('''
                    INSERT INTO stock_ledger
                      (product_id, from_location_id, to_location_id, qty_change,
                       operation_type, reference_id, reference_type, created_by)
                    VALUES (%s, NULL, %s, %s, 'receipt', %s, 'receipt', %s)
                ''', (product_id, location_id, qty, receipt_id, user_id))

            # Mark done
            cur.execute(
                "UPDATE receipts SET status='done', validated_at=NOW() WHERE id=%s",
                (receipt_id,)
            )
            conn.commit()
            row   = _fetch_one(cur, receipt_id)
            lines = _fetch_lines(cur, receipt_id)
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(_serialize(row, lines))
