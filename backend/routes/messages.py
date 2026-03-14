from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from db import get_connection

messages_bp = Blueprint('messages', __name__)


@messages_bp.route('/messages/inbox', methods=['GET'])
@jwt_required()
def get_inbox():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT id, sender_name, sender_avatar, preview, sent_at, is_read, online_status '
                'FROM messages ORDER BY id'
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify([
        {
            'id':           r['id'],
            'senderName':   r['sender_name'],
            'senderAvatar': r['sender_avatar'],
            'preview':      r['preview'],
            'sentAt':       r['sent_at'],
            'isRead':       bool(r['is_read']),
            'onlineStatus': r['online_status'],
        }
        for r in rows
    ])
