from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from datetime import datetime, timedelta
from db import get_connection
from utils.email import generate_otp, send_otp_email

auth_bp = Blueprint('auth', __name__)

OTP_EXPIRY_MINUTES = 10


# ── Helpers ──────────────────────────────────────────────────────────────────

def _store_otp(email, otp_code, purpose):
    """Invalidate previous unused OTPs for the same email/purpose, then store a new one."""
    expires_at = datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES)
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'UPDATE otp_tokens SET used = 1 WHERE email = %s AND purpose = %s AND used = 0',
                (email, purpose),
            )
            cur.execute(
                'INSERT INTO otp_tokens (email, otp_code, purpose, expires_at) VALUES (%s, %s, %s, %s)',
                (email, otp_code, purpose, expires_at),
            )
    finally:
        conn.close()


def _verify_otp(email, otp_code, purpose):
    """Return True and mark the OTP as used if it is valid; otherwise return False."""
    now = datetime.utcnow()
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT id FROM otp_tokens
                   WHERE email = %s AND otp_code = %s AND purpose = %s
                     AND used = 0 AND expires_at > %s
                   ORDER BY id DESC LIMIT 1''',
                (email, otp_code, purpose, now),
            )
            row = cur.fetchone()
            if not row:
                return False
            cur.execute('UPDATE otp_tokens SET used = 1 WHERE id = %s', (row['id'],))
            return True
    finally:
        conn.close()


# ── Routes ───────────────────────────────────────────────────────────────────

@auth_bp.route('/login', methods=['POST'])
def login():
    data     = request.get_json()
    email    = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM users WHERE email = %s', (email,))
            user = cur.fetchone()
    finally:
        conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = create_access_token(identity=str(user['id']))
    return jsonify({
        'access_token': token,
        'user': {
            'id':         user['id'],
            'name':       user['name'],
            'email':      user['email'],
            'username':   user['username'],
            'avatar_url': user['avatar_url'],
        },
    })


@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    """
    Send a 6-digit OTP to *email* for a given *purpose* ('register' or 'reset').

    - purpose='register': rejects if email is already registered.
    - purpose='reset'   : silently succeeds if email is not registered (avoids enumeration).
    """
    data    = request.get_json()
    email   = data.get('email', '').strip()
    purpose = data.get('purpose', '').strip()

    if not email:
        return jsonify({'error': 'Email is required'}), 400
    if purpose not in ('register', 'reset'):
        return jsonify({'error': "purpose must be 'register' or 'reset'"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id FROM users WHERE email = %s', (email,))
            existing = cur.fetchone()
    finally:
        conn.close()

    if purpose == 'register' and existing:
        return jsonify({'error': 'Email is already registered'}), 409

    if purpose == 'reset' and not existing:
        return jsonify({'message': 'If that email is registered, an OTP has been sent.'})

    otp_code = generate_otp()
    _store_otp(email, otp_code, purpose)

    try:
        send_otp_email(email, otp_code, purpose)
    except RuntimeError as exc:
        return jsonify({'error': str(exc)}), 500

    return jsonify({'message': 'OTP sent to your email address.'})


@auth_bp.route('/register', methods=['POST'])
def register():
    data     = request.get_json()
    name     = data.get('name', '').strip()
    username = data.get('user_id', '').strip()
    email    = data.get('email', '').strip()
    password = data.get('password', '')
    repeat   = data.get('password_repeat', '')
    otp      = data.get('otp', '').strip()

    if not all([name, username, email, password, otp]):
        return jsonify({'error': 'All fields are required'}), 400
    if password != repeat:
        return jsonify({'error': 'Passwords do not match'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    if not _verify_otp(email, otp, 'register'):
        return jsonify({'error': 'Invalid or expired OTP'}), 400

    hashed = generate_password_hash(password)

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT id FROM users WHERE email = %s OR username = %s',
                (email, username),
            )
            if cur.fetchone():
                return jsonify({'error': 'Email or username already taken'}), 409
            cur.execute(
                'INSERT INTO users (username, email, password_hash, name) VALUES (%s, %s, %s, %s)',
                (username, email, hashed, name),
            )
            new_id = cur.lastrowid
            cur.execute('SELECT * FROM users WHERE id = %s', (new_id,))
            user = cur.fetchone()
    finally:
        conn.close()

    token = create_access_token(identity=str(user['id']))
    return jsonify({
        'access_token': token,
        'user': {
            'id':         user['id'],
            'name':       user['name'],
            'email':      user['email'],
            'username':   user['username'],
            'avatar_url': user['avatar_url'],
        },
    }), 201


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data         = request.get_json()
    email        = data.get('email', '').strip()
    otp          = data.get('otp', '').strip()
    new_password = data.get('new_password', '')
    confirm      = data.get('confirm_password', '')

    if not all([email, otp, new_password, confirm]):
        return jsonify({'error': 'All fields are required'}), 400
    if new_password != confirm:
        return jsonify({'error': 'Passwords do not match'}), 400
    if len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    if not _verify_otp(email, otp, 'reset'):
        return jsonify({'error': 'Invalid or expired OTP'}), 400

    hashed = generate_password_hash(new_password)
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'UPDATE users SET password_hash = %s WHERE email = %s',
                (hashed, email),
            )
            if cur.rowcount == 0:
                return jsonify({'error': 'Email not found'}), 404
    finally:
        conn.close()

    return jsonify({'message': 'Password reset successfully. You can now log in.'})
