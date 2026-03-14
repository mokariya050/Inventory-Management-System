from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_connection
from utils.roles import require_role, ROLE_LEVELS, VALID_ROLES, get_user_role

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@require_role('manager')
def list_users():
    """List all users. Accessible to manager and admin."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT id, username, email, name, role, phone, created_at '
                'FROM users ORDER BY created_at DESC'
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify([
        {
            'id':         r['id'],
            'username':   r['username'],
            'email':      r['email'],
            'name':       r['name'],
            'role':       r['role'],
            'phone':      r['phone'],
            'created_at': r['created_at'].isoformat() if r['created_at'] else None,
        }
        for r in rows
    ])


@admin_bp.route('/users/<int:target_id>/role', methods=['PUT'])
@jwt_required()
@require_role('manager')
def assign_role(target_id):
    """
    Assign (or clear) a role for a user.

    Rules:
    - You cannot change your own role.
    - You can only assign roles strictly below your own level
      (manager can assign 'staff'; admin can assign 'manager' or 'staff').
    - You cannot modify a user whose current role is >= your own level.
    - Passing role=null/empty clears the role (sets to NULL).
    """
    actor_id = get_jwt_identity()
    if str(target_id) == str(actor_id):
        return jsonify({'error': 'You cannot change your own role'}), 403

    actor_role  = get_user_role(actor_id)
    actor_level = ROLE_LEVELS.get(actor_role, 0)

    data     = request.get_json()
    new_role = (data.get('role') or '').strip() or None

    if new_role is not None and new_role not in VALID_ROLES:
        return jsonify({'error': f"Invalid role. Allowed values: {', '.join(VALID_ROLES)}"}), 400

    new_level = ROLE_LEVELS.get(new_role, 0)
    if new_level >= actor_level:
        return jsonify({'error': 'You cannot assign a role equal to or higher than your own'}), 403

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id, role FROM users WHERE id = %s', (target_id,))
            target = cur.fetchone()
            if not target:
                return jsonify({'error': 'User not found'}), 404

            target_level = ROLE_LEVELS.get(target['role'], 0)
            if target_level >= actor_level:
                return jsonify({'error': 'You cannot modify a user with an equal or higher role'}), 403

            cur.execute('UPDATE users SET role = %s WHERE id = %s', (new_role, target_id))
            cur.execute(
                'SELECT id, username, email, name, role, created_at FROM users WHERE id = %s',
                (target_id,)
            )
            updated = cur.fetchone()
    finally:
        conn.close()

    return jsonify({
        'id':       updated['id'],
        'username': updated['username'],
        'email':    updated['email'],
        'name':     updated['name'],
        'role':     updated['role'],
        'created_at': updated['created_at'].isoformat() if updated['created_at'] else None,
    })


@admin_bp.route('/users/<int:target_id>', methods=['DELETE'])
@jwt_required()
@require_role('admin')
def delete_user(target_id):
    """Permanently delete a user. Admin only."""
    actor_id = get_jwt_identity()
    if str(target_id) == str(actor_id):
        return jsonify({'error': 'You cannot delete your own account'}), 403

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id FROM users WHERE id = %s', (target_id,))
            if not cur.fetchone():
                return jsonify({'error': 'User not found'}), 404
            cur.execute('DELETE FROM users WHERE id = %s', (target_id,))
    finally:
        conn.close()

    return jsonify({'message': 'User deleted'})
