from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from db import get_connection

users_bp = Blueprint('users', __name__)


@users_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT id, username, email, name, role, address, city, country, avatar_url '
                'FROM users WHERE id = %s',
                (user_id,)
            )
            user = cur.fetchone()
    finally:
        conn.close()

    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user)


@users_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_me():
    user_id = get_jwt_identity()
    data = request.get_json()

    username = data.get('username', '').strip()
    email    = data.get('email', '').strip()
    name     = data.get('name', '').strip()

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'UPDATE users SET username=%s, email=%s, name=%s WHERE id=%s',
                (username, email, name, user_id)
            )
            cur.execute(
                'SELECT id, username, email, name, role, address, city, country, avatar_url '
                'FROM users WHERE id = %s',
                (user_id,)
            )
            user = cur.fetchone()
    finally:
        conn.close()

    return jsonify(user)


@users_bp.route('/me/contact', methods=['PUT'])
@jwt_required()
def update_contact():
    user_id = get_jwt_identity()
    data = request.get_json()

    address = data.get('address', '').strip()
    city    = data.get('city', '').strip()
    country = data.get('country', '').strip()

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'UPDATE users SET address=%s, city=%s, country=%s WHERE id=%s',
                (address, city, country, user_id)
            )
            cur.execute(
                'SELECT id, username, email, name, role, address, city, country, avatar_url '
                'FROM users WHERE id = %s',
                (user_id,)
            )
            user = cur.fetchone()
    finally:
        conn.close()

    return jsonify(user)
