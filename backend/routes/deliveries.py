from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_connection
from utils.ref import generate_ref

deliveries_bp = Blueprint('deliveries', __name__)


def _serialize(r, lines=None):
    obj = {
        'id':             r['id'],
        'ref':            r['ref'],
        'customer_name':  r['customer_name'],
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


def _fetch_one(cur, delivery_id):
    cur.execute('''
        SELECT d.*, l.name AS location_name, w.name AS warehouse_name
        FROM deliveries d
        LEFT JOIN locations l  ON l.id = d.location_id
        LEFT JOIN warehouses w ON w.id = l.warehouse_id
        WHERE d.id = %s
    ''', (delivery_id,))
    return cur.fetchone()


def _fetch_lines(cur, delivery_id):
    cur.execute('''
        SELECT dl.id, dl.product_id, p.name AS product_name, p.sku,
               p.unit_of_measure, dl.qty_ordered, dl.qty_done
        FROM delivery_lines dl
        JOIN products p ON p.id = dl.product_id
        WHERE dl.delivery_id = %s
        ORDER BY dl.id
    ''', (delivery_id,))
    return [dict(row) for row in cur.fetchall()]


@deliveries_bp.route('', methods=['GET'])
@jwt_required()
def list_deliveries():
    status = request.args.get('status', '')
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            sql = '''
                SELECT d.*, l.name AS location_name, w.name AS warehouse_name,
                       COUNT(dl.id) AS line_count
                FROM deliveries d
                LEFT JOIN locations l  ON l.id = d.location_id
                LEFT JOIN warehouses w ON w.id = l.warehouse_id
                LEFT JOIN delivery_lines dl ON dl.delivery_id = d.id
                WHERE 1=1
            '''
            params = []
            if status:
                sql += ' AND d.status = %s'
                params.append(status)
            sql += ' GROUP BY d.id ORDER BY d.created_at DESC'
            cur.execute(sql, params)
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify([{**_serialize(r), 'line_count': r['line_count']} for r in rows])


@deliveries_bp.route('', methods=['POST'])
@jwt_required()
def create_delivery():
    data          = request.get_json() or {}
    user_id       = get_jwt_identity()
    customer_name = (data.get('customer_name') or '').strip() or None
    location_id   = data.get('location_id')
    notes         = (data.get('notes') or '').strip() or None
    lines_data    = data.get('lines', [])

    if not location_id:
        return jsonify({'error': 'location_id is required'}), 400

    ref = generate_ref('DEL')
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO deliveries (ref, customer_name, location_id, notes, created_by) VALUES (%s,%s,%s,%s,%s)',
                (ref, customer_name, location_id, notes, user_id)
            )
            delivery_id = cur.lastrowid
            for line in lines_data:
                cur.execute(
                    'INSERT INTO delivery_lines (delivery_id, product_id, qty_ordered, qty_done) VALUES (%s,%s,%s,%s)',
                    (delivery_id, line['product_id'], int(line.get('qty_ordered', 0)), int(line.get('qty_done', 0)))
                )
            conn.commit()
            row   = _fetch_one(cur, delivery_id)
            lines = _fetch_lines(cur, delivery_id)
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(_serialize(row, lines)), 201


@deliveries_bp.route('/<int:delivery_id>', methods=['GET'])
@jwt_required()
def get_delivery(delivery_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            row = _fetch_one(cur, delivery_id)
            if not row:
                return jsonify({'error': 'Delivery not found'}), 404
            lines = _fetch_lines(cur, delivery_id)
    finally:
        conn.close()
    return jsonify(_serialize(row, lines))


@deliveries_bp.route('/<int:delivery_id>', methods=['PUT'])
@jwt_required()
def update_delivery(delivery_id):
    data = request.get_json() or {}
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            row = _fetch_one(cur, delivery_id)
            if not row:
                return jsonify({'error': 'Delivery not found'}), 404
            if row['status'] == 'done':
                return jsonify({'error': 'Cannot edit a validated delivery'}), 400

            fields, params = [], []
            for col in ('customer_name', 'location_id', 'notes', 'status'):
                if col in data:
                    fields.append(f'{col} = %s')
                    params.append(data[col])
            if fields:
                params.append(delivery_id)
                cur.execute(f"UPDATE deliveries SET {', '.join(fields)} WHERE id = %s", params)

            if 'lines' in data:
                cur.execute('DELETE FROM delivery_lines WHERE delivery_id = %s', (delivery_id,))
                for line in data['lines']:
                    cur.execute(
                        'INSERT INTO delivery_lines (delivery_id, product_id, qty_ordered, qty_done) VALUES (%s,%s,%s,%s)',
                        (delivery_id, line['product_id'], int(line.get('qty_ordered', 0)), int(line.get('qty_done', 0)))
                    )
            conn.commit()
            row   = _fetch_one(cur, delivery_id)
            lines = _fetch_lines(cur, delivery_id)
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(_serialize(row, lines))


@deliveries_bp.route('/<int:delivery_id>', methods=['DELETE'])
@jwt_required()
def delete_delivery(delivery_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT status FROM deliveries WHERE id = %s', (delivery_id,))
            row = cur.fetchone()
            if not row:
                return jsonify({'error': 'Delivery not found'}), 404
            if row['status'] == 'done':
                return jsonify({'error': 'Cannot delete a validated delivery'}), 400
            cur.execute('DELETE FROM deliveries WHERE id = %s', (delivery_id,))
            conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'message': 'Delivery deleted'})


@deliveries_bp.route('/<int:delivery_id>/validate', methods=['POST'])
@jwt_required()
def validate_delivery(delivery_id):
    user_id = get_jwt_identity()
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            row = _fetch_one(cur, delivery_id)
            if not row:
                return jsonify({'error': 'Delivery not found'}), 404
            if row['status'] != 'ready':
                return jsonify({'error': 'Delivery must be in Ready status to validate'}), 400

            lines       = _fetch_lines(cur, delivery_id)
            location_id = row['location_id']

            # Check sufficient stock BEFORE making any changes
            for line in lines:
                qty = int(line['qty_done'])
                if qty <= 0:
                    continue
                product_id = line['product_id']
                cur.execute(
                    'SELECT COALESCE(qty, 0) AS qty FROM stock_levels WHERE product_id=%s AND location_id=%s',
                    (product_id, location_id)
                )
                sl = cur.fetchone()
                available = int(sl['qty']) if sl else 0
                if available < qty:
                    return jsonify({
                        'error': f"Insufficient stock for '{line['product_name']}': "
                                 f"available {available}, requested {qty}"
                    }), 400

            for line in lines:
                qty = int(line['qty_done'])
                if qty <= 0:
                    continue
                product_id = line['product_id']

                cur.execute(
                    'UPDATE stock_levels SET qty = qty - %s WHERE product_id=%s AND location_id=%s',
                    (qty, product_id, location_id)
                )
                cur.execute('''
                    INSERT INTO stock_ledger
                      (product_id, from_location_id, to_location_id, qty_change,
                       operation_type, reference_id, reference_type, created_by)
                    VALUES (%s, %s, NULL, %s, 'delivery', %s, 'delivery', %s)
                ''', (product_id, location_id, -qty, delivery_id, user_id))

            cur.execute(
                "UPDATE deliveries SET status='done', validated_at=NOW() WHERE id=%s",
                (delivery_id,)
            )
            conn.commit()
            row   = _fetch_one(cur, delivery_id)
            lines = _fetch_lines(cur, delivery_id)
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(_serialize(row, lines))
