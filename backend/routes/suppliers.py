from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from db import get_connection

suppliers_bp = Blueprint('suppliers', __name__)


@suppliers_bp.route('', methods=['GET'])
@jwt_required()
def list_suppliers():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id, name, contact_email, phone FROM suppliers ORDER BY name')
            rows = cur.fetchall()
    finally:
        conn.close()
    return jsonify(rows)


@suppliers_bp.route('', methods=['POST'])
@jwt_required()
def create_supplier():
    data = request.get_json() or {}
    name  = (data.get('name') or '').strip()
    email = (data.get('contact_email') or '').strip() or None
    phone = (data.get('phone') or '').strip() or None

    if not name:
        return jsonify({'error': 'Name is required'}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO suppliers (name, contact_email, phone) VALUES (%s,%s,%s)',
                (name, email, phone)
            )
            conn.commit()
            new_id = cur.lastrowid
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'id': new_id, 'name': name, 'contact_email': email, 'phone': phone}), 201


@suppliers_bp.route('/<int:sup_id>', methods=['PUT'])
@jwt_required()
def update_supplier(sup_id):
    data = request.get_json() or {}
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id FROM suppliers WHERE id = %s', (sup_id,))
            if not cur.fetchone():
                return jsonify({'error': 'Supplier not found'}), 404

            fields, params = [], []
            if 'name' in data:
                fields.append('name = %s')
                params.append(data['name'])
            if 'contact_email' in data:
                fields.append('contact_email = %s')
                params.append(data['contact_email'] or None)
            if 'phone' in data:
                fields.append('phone = %s')
                params.append(data['phone'] or None)

            if fields:
                params.append(sup_id)
                cur.execute(f"UPDATE suppliers SET {', '.join(fields)} WHERE id = %s", params)
                conn.commit()

            cur.execute('SELECT id, name, contact_email, phone FROM suppliers WHERE id = %s', (sup_id,))
            row = cur.fetchone()
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(row)
