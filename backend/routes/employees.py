from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from db import get_connection

employees_bp = Blueprint('employees', __name__)


@employees_bp.route('/employees', methods=['GET'])
@jwt_required()
def get_employees():
    page      = max(1, int(request.args.get('page', 1)))
    page_size = int(request.args.get('pageSize', 10))
    search    = request.args.get('search', '').strip()
    offset    = (page - 1) * page_size

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            if search:
                like = f'%{search}%'
                cur.execute(
                    'SELECT COUNT(*) AS cnt FROM employees '
                    'WHERE name LIKE %s OR position LIKE %s OR office LIKE %s',
                    (like, like, like)
                )
                total = cur.fetchone()['cnt']
                cur.execute(
                    'SELECT * FROM employees '
                    'WHERE name LIKE %s OR position LIKE %s OR office LIKE %s '
                    'ORDER BY id LIMIT %s OFFSET %s',
                    (like, like, like, page_size, offset)
                )
            else:
                cur.execute('SELECT COUNT(*) AS cnt FROM employees')
                total = cur.fetchone()['cnt']
                cur.execute('SELECT * FROM employees ORDER BY id LIMIT %s OFFSET %s',
                            (page_size, offset))
            rows = cur.fetchall()
    finally:
        conn.close()

    employees = []
    for r in rows:
        employees.append({
            'id':        r['id'],
            'name':      r['name'],
            'position':  r['position'],
            'office':    r['office'],
            'age':       r['age'],
            'startDate': str(r['start_date']),
            'salary':    float(r['salary']),
            'avatarUrl': r['avatar_url'],
        })

    return jsonify({'data': employees, 'total': total, 'page': page, 'pageSize': page_size})
