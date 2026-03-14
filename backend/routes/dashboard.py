from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from db import get_connection

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def stats():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # Total distinct products
            cur.execute('SELECT COUNT(*) AS cnt FROM products')
            total_products = cur.fetchone()['cnt']

            # Per-product total stock
            cur.execute('''
                SELECT p.id, p.min_stock,
                       COALESCE(SUM(sl.qty), 0) AS total_qty
                FROM products p
                LEFT JOIN stock_levels sl ON sl.product_id = p.id
                GROUP BY p.id, p.min_stock
            ''')
            stock_rows = cur.fetchall()

            low_stock_count    = sum(1 for r in stock_rows if 0 < r['total_qty'] < r['min_stock'])
            out_of_stock_count = sum(1 for r in stock_rows if r['total_qty'] == 0)

            # Pending operation counts (draft or ready)
            for table, key in [('receipts', 'pending_receipts'),
                                ('deliveries', 'pending_deliveries'),
                                ('transfers', 'pending_transfers')]:
                cur.execute(
                    f"SELECT COUNT(*) AS cnt FROM {table} WHERE status IN ('draft','ready')"
                )
                locals()[key] = cur.fetchone()['cnt']

            # 5 most recent ledger entries
            cur.execute('''
                SELECT sl.id, sl.qty_change, sl.operation_type, sl.reference_type,
                       sl.created_at,
                       p.name AS product_name, p.sku,
                       fl.name AS from_location, tl.name AS to_location
                FROM stock_ledger sl
                JOIN products p  ON p.id = sl.product_id
                LEFT JOIN locations fl ON fl.id = sl.from_location_id
                LEFT JOIN locations tl ON tl.id = sl.to_location_id
                ORDER BY sl.created_at DESC
                LIMIT 5
            ''')
            movements = cur.fetchall()
    finally:
        conn.close()

    return jsonify({
        'total_products':    total_products,
        'low_stock_count':   low_stock_count,
        'out_of_stock_count': out_of_stock_count,
        'pending_receipts':  locals().get('pending_receipts', 0),
        'pending_deliveries': locals().get('pending_deliveries', 0),
        'pending_transfers': locals().get('pending_transfers', 0),
        'recent_movements': [
            {
                'id':            m['id'],
                'product_name':  m['product_name'],
                'sku':           m['sku'],
                'operation_type': m['operation_type'],
                'qty_change':    m['qty_change'],
                'from_location': m['from_location'],
                'to_location':   m['to_location'],
                'created_at':    m['created_at'].isoformat() if m['created_at'] else None,
            }
            for m in movements
        ],
    })


@dashboard_bp.route('/stock-by-category', methods=['GET'])
@jwt_required()
def stock_by_category():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT COALESCE(pc.name, 'Uncategorized') AS category,
                       COALESCE(SUM(sl.qty), 0) AS total_qty
                FROM products p
                LEFT JOIN product_categories pc ON pc.id = p.category_id
                LEFT JOIN stock_levels sl ON sl.product_id = p.id
                GROUP BY pc.id, pc.name
                ORDER BY COALESCE(SUM(sl.qty), 0) DESC
            ''')
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify([
        {'category': r['category'], 'total_qty': int(r['total_qty'])}
        for r in rows
    ])


@dashboard_bp.route('/low-stock', methods=['GET'])
@jwt_required()
def low_stock():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT p.id, p.sku, p.name, p.min_stock,
                       COALESCE(pc.name, 'Uncategorized') AS category,
                       COALESCE(SUM(sl.qty), 0) AS total_qty
                FROM products p
                LEFT JOIN product_categories pc ON pc.id = p.category_id
                LEFT JOIN stock_levels sl ON sl.product_id = p.id
                GROUP BY p.id, p.sku, p.name, p.min_stock, pc.name
                HAVING COALESCE(SUM(sl.qty), 0) < p.min_stock
                ORDER BY (COALESCE(SUM(sl.qty), 0) / GREATEST(p.min_stock, 1)) ASC
            ''')
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify([
        {
            'id':        r['id'],
            'sku':       r['sku'],
            'name':      r['name'],
            'category':  r['category'],
            'min_stock': r['min_stock'],
            'stock':     int(r['total_qty']),
        }
        for r in rows
    ])
