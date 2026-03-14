from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from db import get_connection

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def stats():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM dashboard_stats LIMIT 1')
            row = cur.fetchone()
    finally:
        conn.close()

    if not row:
        return jsonify({'error': 'No stats found'}), 404

    return jsonify({
        'monthly_earnings': float(row['monthly_earnings']),
        'annual_earnings':  float(row['annual_earnings']),
        'task_completion_pct': row['task_completion_pct'],
        'pending_requests':    row['pending_requests'],
    })


@dashboard_bp.route('/earnings', methods=['GET'])
@jwt_required()
def earnings():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT month_label, amount FROM earnings_history ORDER BY id')
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify({
        'labels': [r['month_label'] for r in rows],
        'values': [float(r['amount']) for r in rows],
    })


@dashboard_bp.route('/revenue-sources', methods=['GET'])
@jwt_required()
def revenue_sources():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT label, value, color FROM revenue_sources ORDER BY id')
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify({
        'labels': [r['label'] for r in rows],
        'values': [r['value'] for r in rows],
        'colors': [r['color'] for r in rows],
    })
