from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_connection

products_bp = Blueprint('products', __name__)


@products_bp.route('', methods=['GET'])
@jwt_required()
def list_products():
    search      = request.args.get('search', '').strip()
    category_id = request.args.get('category_id', type=int)

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            sql = '''
                SELECT p.id, p.sku, p.name, p.unit_of_measure, p.min_stock,
                       p.category_id, COALESCE(pc.name, 'Uncategorized') AS category,
                       p.created_at,
                       COALESCE(SUM(sl.qty), 0) AS total_stock
                FROM products p
                LEFT JOIN product_categories pc ON pc.id = p.category_id
                LEFT JOIN stock_levels sl ON sl.product_id = p.id
                WHERE 1=1
            '''
            params = []
            if search:
                sql += ' AND (p.name LIKE %s OR p.sku LIKE %s)'
                params += [f'%{search}%', f'%{search}%']
            if category_id:
                sql += ' AND p.category_id = %s'
                params.append(category_id)
            sql += ' GROUP BY p.id, p.sku, p.name, p.unit_of_measure, p.min_stock, p.category_id, pc.name, p.created_at'
            sql += ' ORDER BY p.name'
            cur.execute(sql, params)
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify([_serialize_product(r) for r in rows])


@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    data = request.get_json() or {}
    sku             = (data.get('sku') or '').strip()
    name            = (data.get('name') or '').strip()
    category_id     = data.get('category_id') or None
    unit_of_measure = (data.get('unit_of_measure') or 'unit').strip()
    min_stock       = int(data.get('min_stock') or 0)

    if not sku or not name:
        return jsonify({'error': 'SKU and name are required'}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO products (sku, name, category_id, unit_of_measure, min_stock) VALUES (%s,%s,%s,%s,%s)',
                (sku, name, category_id, unit_of_measure, min_stock)
            )
            conn.commit()
            new_id = cur.lastrowid
            cur.execute('''
                SELECT p.id, p.sku, p.name, p.unit_of_measure, p.min_stock,
                       p.category_id, COALESCE(pc.name,'Uncategorized') AS category,
                       p.created_at, 0 AS total_stock
                FROM products p
                LEFT JOIN product_categories pc ON pc.id = p.category_id
                WHERE p.id = %s
            ''', (new_id,))
            row = cur.fetchone()
    except Exception as e:
        conn.rollback()
        if 'Duplicate entry' in str(e):
            return jsonify({'error': f"SKU '{sku}' already exists"}), 409
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(_serialize_product(row)), 201


@products_bp.route('/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT p.id, p.sku, p.name, p.unit_of_measure, p.min_stock,
                       p.category_id, COALESCE(pc.name,'Uncategorized') AS category,
                       p.created_at,
                       COALESCE(SUM(sl.qty), 0) AS total_stock
                FROM products p
                LEFT JOIN product_categories pc ON pc.id = p.category_id
                LEFT JOIN stock_levels sl ON sl.product_id = p.id
                WHERE p.id = %s
                GROUP BY p.id, pc.name
            ''', (product_id,))
            row = cur.fetchone()
            if not row:
                return jsonify({'error': 'Product not found'}), 404

            # Stock by location
            cur.execute('''
                SELECT l.id AS location_id, l.name AS location_name,
                       w.name AS warehouse_name, sl.qty
                FROM stock_levels sl
                JOIN locations l ON l.id = sl.location_id
                JOIN warehouses w ON w.id = l.warehouse_id
                WHERE sl.product_id = %s
            ''', (product_id,))
            stock_by_location = cur.fetchall()
    finally:
        conn.close()

    result = _serialize_product(row)
    result['stock_by_location'] = [
        {
            'location_id':    s['location_id'],
            'location_name':  s['location_name'],
            'warehouse_name': s['warehouse_name'],
            'qty':            s['qty'],
        }
        for s in stock_by_location
    ]
    return jsonify(result)


@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    data = request.get_json() or {}
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id FROM products WHERE id = %s', (product_id,))
            if not cur.fetchone():
                return jsonify({'error': 'Product not found'}), 404

            fields, params = [], []
            for col in ('sku', 'name', 'unit_of_measure'):
                if col in data:
                    fields.append(f'{col} = %s')
                    params.append(data[col])
            if 'category_id' in data:
                fields.append('category_id = %s')
                params.append(data['category_id'] or None)
            if 'min_stock' in data:
                fields.append('min_stock = %s')
                params.append(int(data['min_stock']))

            if fields:
                params.append(product_id)
                cur.execute(f"UPDATE products SET {', '.join(fields)} WHERE id = %s", params)
                conn.commit()

            cur.execute('''
                SELECT p.id, p.sku, p.name, p.unit_of_measure, p.min_stock,
                       p.category_id, COALESCE(pc.name,'Uncategorized') AS category,
                       p.created_at,
                       COALESCE(SUM(sl.qty),0) AS total_stock
                FROM products p
                LEFT JOIN product_categories pc ON pc.id = p.category_id
                LEFT JOIN stock_levels sl ON sl.product_id = p.id
                WHERE p.id = %s
                GROUP BY p.id, pc.name
            ''', (product_id,))
            row = cur.fetchone()
    except Exception as e:
        conn.rollback()
        if 'Duplicate entry' in str(e):
            return jsonify({'error': 'SKU already exists'}), 409
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(_serialize_product(row))


@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id FROM products WHERE id = %s', (product_id,))
            if not cur.fetchone():
                return jsonify({'error': 'Product not found'}), 404
            cur.execute('DELETE FROM products WHERE id = %s', (product_id,))
            conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'message': 'Product deleted'})


def _serialize_product(r):
    total = int(r['total_stock'])
    min_s = int(r['min_stock'])
    if total == 0:
        stock_status = 'out'
    elif total < min_s:
        stock_status = 'low'
    else:
        stock_status = 'ok'

    return {
        'id':              r['id'],
        'sku':             r['sku'],
        'name':            r['name'],
        'category_id':     r['category_id'],
        'category':        r['category'],
        'unit_of_measure': r['unit_of_measure'],
        'min_stock':       min_s,
        'total_stock':     total,
        'stock_status':    stock_status,
        'created_at':      r['created_at'].isoformat() if r['created_at'] else None,
    }
