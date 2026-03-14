from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from db import get_connection

# ── Role hierarchy ────────────────────────────────────────────────────────────
ROLE_LEVELS = {
    'admin':   3,
    'manager': 2,
    'staff':   1,
}

VALID_ROLES = ('admin', 'manager', 'staff')


def get_user_role(user_id):
    """Return the role string for *user_id*, or None if the user has no role."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT role FROM users WHERE id = %s', (user_id,))
            row = cur.fetchone()
        return row['role'] if row else None
    finally:
        conn.close()


def require_role(min_role):
    """
    Decorator that enforces a minimum role level.

    Must be stacked *below* @jwt_required() so the JWT is already verified::

        @bp.route('/path')
        @jwt_required()
        @require_role('manager')
        def view():
            ...
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            role = get_user_role(user_id)
            if ROLE_LEVELS.get(role, 0) < ROLE_LEVELS.get(min_role, 0):
                return jsonify({'error': 'Insufficient permissions'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
