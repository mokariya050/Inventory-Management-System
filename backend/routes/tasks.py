from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from db import get_connection

tasks_bp = Blueprint('tasks', __name__)


@tasks_bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id, title, due_time, completed FROM tasks ORDER BY id')
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify([
        {'id': r['id'], 'title': r['title'], 'dueTime': r['due_time'],
         'completed': bool(r['completed'])}
        for r in rows
    ])
