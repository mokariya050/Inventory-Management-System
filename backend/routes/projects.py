from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from db import get_connection

projects_bp = Blueprint('projects', __name__)


@projects_bp.route('/projects', methods=['GET'])
@jwt_required()
def get_projects():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id, name, progress, color FROM projects ORDER BY id')
            rows = cur.fetchall()
    finally:
        conn.close()
    return jsonify(rows)
