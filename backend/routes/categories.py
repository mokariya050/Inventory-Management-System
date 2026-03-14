from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from db import get_connection

categories_bp = Blueprint('categories', __name__)


@categories_bp.route('', methods=['GET'])
@jwt_required()
def list_categories():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id, name FROM product_categories ORDER BY name')
            rows = cur.fetchall()
    finally:
        conn.close()
    return jsonify(rows)


@categories_bp.route('', methods=['POST'])
@jwt_required()
def create_category():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'error': 'Name is required'}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('INSERT INTO product_categories (name) VALUES (%s)', (name,))
            conn.commit()
            new_id = cur.lastrowid
    except Exception as e:
        conn.rollback()
        if 'Duplicate entry' in str(e):
            return jsonify({'error': f"Category '{name}' already exists"}), 409
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'id': new_id, 'name': name}), 201


@categories_bp.route('/<int:cat_id>', methods=['PUT'])
@jwt_required()
def update_category(cat_id):
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'error': 'Name is required'}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id FROM product_categories WHERE id = %s', (cat_id,))
            if not cur.fetchone():
                return jsonify({'error': 'Category not found'}), 404
            cur.execute('UPDATE product_categories SET name = %s WHERE id = %s', (name, cat_id))
            conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'id': cat_id, 'name': name})


@categories_bp.route('/<int:cat_id>', methods=['DELETE'])
@jwt_required()
def delete_category(cat_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM product_categories WHERE id = %s', (cat_id,))
            conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'message': 'Category deleted'})
