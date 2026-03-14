from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from db import get_connection

stock_bp = Blueprint('stock', __name__)


@stock_bp.route('/ledger', methods=['GET'])
@jwt_required()
def ledger():
    product_id  = request.args.get('product_id', type=int)
    location_id = request.args.get('location_id', type=int)
    op_type     = request.args.get('type', '')
    page        = request.args.get('page', 1, type=int)
    per_page    = request.args.get('per_page', 20, type=int)
    per_page    = min(per_page, 100)
    offset      = (page - 1) * per_page

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            where, params = ['1=1'], []
            if product_id:
                where.append('sl.product_id = %s')
                params.append(product_id)
            if location_id:
                where.append('(sl.from_location_id = %s OR sl.to_location_id = %s)')
                params += [location_id, location_id]
            if op_type:
                where.append('sl.operation_type = %s')
                params.append(op_type)

            where_clause = ' AND '.join(where)

            cur.execute(f'SELECT COUNT(*) AS cnt FROM stock_ledger sl WHERE {where_clause}', params)
            total = cur.fetchone()['cnt']

            cur.execute(f'''
                SELECT sl.id, sl.qty_change, sl.operation_type, sl.reference_id,
                       sl.reference_type, sl.created_at,
                       p.id AS product_id, p.name AS product_name, p.sku,
                       fl.id AS from_location_id, fl.name AS from_location,
                       fw.name AS from_warehouse,
                       tl.id AS to_location_id,   tl.name AS to_location,
                       tw.name AS to_warehouse,
                       u.name AS created_by_name
                FROM stock_ledger sl
                JOIN products p   ON p.id = sl.product_id
                LEFT JOIN locations fl  ON fl.id = sl.from_location_id
                LEFT JOIN warehouses fw ON fw.id = fl.warehouse_id
                LEFT JOIN locations tl  ON tl.id = sl.to_location_id
                LEFT JOIN warehouses tw ON tw.id = tl.warehouse_id
                LEFT JOIN users u ON u.id = sl.created_by
                WHERE {where_clause}
                ORDER BY sl.created_at DESC
                LIMIT %s OFFSET %s
            ''', params + [per_page, offset])
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify({
        'total':    total,
        'page':     page,
        'per_page': per_page,
        'pages':    (total + per_page - 1) // per_page,
        'items': [
            {
                'id':              r['id'],
                'product_id':      r['product_id'],
                'product_name':    r['product_name'],
                'sku':             r['sku'],
                'qty_change':      r['qty_change'],
                'operation_type':  r['operation_type'],
                'reference_id':    r['reference_id'],
                'reference_type':  r['reference_type'],
                'from_location_id': r['from_location_id'],
                'from_location':   r['from_location'],
                'from_warehouse':  r['from_warehouse'],
                'to_location_id':  r['to_location_id'],
                'to_location':     r['to_location'],
                'to_warehouse':    r['to_warehouse'],
                'created_by_name': r['created_by_name'],
                'created_at':      r['created_at'].isoformat() if r['created_at'] else None,
            }
            for r in rows
        ],
    })


@stock_bp.route('/levels', methods=['GET'])
@jwt_required()
def levels():
    product_id  = request.args.get('product_id', type=int)
    location_id = request.args.get('location_id', type=int)
    warehouse_id = request.args.get('warehouse_id', type=int)

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            sql = '''
                SELECT sl.product_id, p.name AS product_name, p.sku,
                       sl.location_id, l.name AS location_name,
                       l.warehouse_id, w.name AS warehouse_name,
                       sl.qty
                FROM stock_levels sl
                JOIN products p   ON p.id = sl.product_id
                JOIN locations l  ON l.id = sl.location_id
                JOIN warehouses w ON w.id = l.warehouse_id
                WHERE sl.qty > 0
            '''
            params = []
            if product_id:
                sql += ' AND sl.product_id = %s'
                params.append(product_id)
            if location_id:
                sql += ' AND sl.location_id = %s'
                params.append(location_id)
            if warehouse_id:
                sql += ' AND l.warehouse_id = %s'
                params.append(warehouse_id)
            sql += ' ORDER BY p.name, w.name, l.name'
            cur.execute(sql, params)
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify([
        {
            'product_id':     r['product_id'],
            'product_name':   r['product_name'],
            'sku':            r['sku'],
            'location_id':    r['location_id'],
            'location_name':  r['location_name'],
            'warehouse_id':   r['warehouse_id'],
            'warehouse_name': r['warehouse_name'],
            'qty':            r['qty'],
        }
        for r in rows
    ])
