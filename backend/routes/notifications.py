from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from db import get_connection

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT id, message, icon, icon_bg, created_at, is_read '
                'FROM notifications ORDER BY created_at DESC'
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify([
        {
            'id':      r['id'],
            'message': r['message'],
            'icon':    r['icon'],
            'iconBg':  r['icon_bg'],
            'date':    r['created_at'].strftime('%B %d, %Y') if r['created_at'] else '',
            'isRead':  bool(r['is_read']),
        }
        for r in rows
    ])
