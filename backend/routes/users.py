from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
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
                'SELECT id, username, email, name, role, address, city, country, phone, avatar_url '
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
                'SELECT id, username, email, name, role, address, city, country, phone, avatar_url '
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
    phone   = data.get('phone', '').strip()

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'UPDATE users SET address=%s, city=%s, country=%s, phone=%s WHERE id=%s',
                (address, city, country, phone, user_id)
            )
            cur.execute(
                'SELECT id, username, email, name, role, address, city, country, phone, avatar_url '
                'FROM users WHERE id = %s',
                (user_id,)
            )
            user = cur.fetchone()
    finally:
        conn.close()

    return jsonify(user)


@users_bp.route('/me/password', methods=['PUT'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    data = request.get_json()

    current_password = data.get('current_password', '').strip()
    new_password     = data.get('new_password', '').strip()
    confirm_password = data.get('confirm_password', '').strip()

    if not current_password or not new_password or not confirm_password:
        return jsonify({'error': 'All fields are required'}), 400
    if new_password != confirm_password:
        return jsonify({'error': 'New passwords do not match'}), 400
    if len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT password_hash FROM users WHERE id = %s', (user_id,))
            user = cur.fetchone()
            if not user or not check_password_hash(user['password_hash'], current_password):
                return jsonify({'error': 'Current password is incorrect'}), 400
            cur.execute(
                'UPDATE users SET password_hash=%s WHERE id=%s',
                (generate_password_hash(new_password), user_id)
            )
    finally:
        conn.close()

    return jsonify({'message': 'Password changed successfully'})
