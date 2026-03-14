from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from db import get_connection

warehouses_bp = Blueprint('warehouses', __name__)


# ── Warehouses ──────────────────────────────────────────────────

@warehouses_bp.route('', methods=['GET'])
@jwt_required()
def list_warehouses():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id, name, short_code, address FROM warehouses ORDER BY name')
            warehouses = cur.fetchall()
            cur.execute('SELECT id, warehouse_id, name, code FROM locations ORDER BY warehouse_id, name')
            locations = cur.fetchall()
    finally:
        conn.close()

    loc_by_wh = {}
    for loc in locations:
        loc_by_wh.setdefault(loc['warehouse_id'], []).append(loc)

    return jsonify([
        {**wh, 'locations': loc_by_wh.get(wh['id'], [])}
        for wh in warehouses
    ])


@warehouses_bp.route('', methods=['POST'])
@jwt_required()
def create_warehouse():
    data = request.get_json() or {}
    name       = (data.get('name') or '').strip()
    short_code = (data.get('short_code') or '').strip().upper()
    address    = (data.get('address') or '').strip() or None

    if not name or not short_code:
        return jsonify({'error': 'Name and short_code are required'}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO warehouses (name, short_code, address) VALUES (%s,%s,%s)',
                (name, short_code, address)
            )
            conn.commit()
            new_id = cur.lastrowid
    except Exception as e:
        conn.rollback()
        if 'Duplicate entry' in str(e):
            return jsonify({'error': f"Short code '{short_code}' already exists"}), 409
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'id': new_id, 'name': name, 'short_code': short_code, 'address': address, 'locations': []}), 201


@warehouses_bp.route('/<int:wh_id>', methods=['PUT'])
@jwt_required()
def update_warehouse(wh_id):
    data = request.get_json() or {}
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id FROM warehouses WHERE id = %s', (wh_id,))
            if not cur.fetchone():
                return jsonify({'error': 'Warehouse not found'}), 404

            fields, params = [], []
            for col in ('name', 'address'):
                if col in data:
                    fields.append(f'{col} = %s')
                    params.append(data[col])
            if 'short_code' in data:
                fields.append('short_code = %s')
                params.append((data['short_code'] or '').upper())
            if fields:
                params.append(wh_id)
                cur.execute(f"UPDATE warehouses SET {', '.join(fields)} WHERE id = %s", params)
                conn.commit()

            cur.execute('SELECT id, name, short_code, address FROM warehouses WHERE id = %s', (wh_id,))
            row = cur.fetchone()
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(row)


@warehouses_bp.route('/<int:wh_id>', methods=['DELETE'])
@jwt_required()
def delete_warehouse(wh_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM warehouses WHERE id = %s', (wh_id,))
            conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'message': 'Warehouse deleted'})


# ── Locations ────────────────────────────────────────────────────

@warehouses_bp.route('/<int:wh_id>/locations', methods=['GET'])
@jwt_required()
def list_locations(wh_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT id, warehouse_id, name, code FROM locations WHERE warehouse_id = %s ORDER BY name',
                (wh_id,)
            )
            rows = cur.fetchall()
    finally:
        conn.close()
    return jsonify(rows)


@warehouses_bp.route('/<int:wh_id>/locations', methods=['POST'])
@jwt_required()
def create_location(wh_id):
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    code = (data.get('code') or '').strip().upper()

    if not name or not code:
        return jsonify({'error': 'Name and code are required'}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id FROM warehouses WHERE id = %s', (wh_id,))
            if not cur.fetchone():
                return jsonify({'error': 'Warehouse not found'}), 404
            cur.execute(
                'INSERT INTO locations (warehouse_id, name, code) VALUES (%s,%s,%s)',
                (wh_id, name, code)
            )
            conn.commit()
            new_id = cur.lastrowid
    except Exception as e:
        conn.rollback()
        if 'Duplicate entry' in str(e):
            return jsonify({'error': f"Location code '{code}' already exists in this warehouse"}), 409
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'id': new_id, 'warehouse_id': wh_id, 'name': name, 'code': code}), 201


@warehouses_bp.route('/locations/<int:loc_id>', methods=['DELETE'])
@jwt_required()
def delete_location(loc_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM locations WHERE id = %s', (loc_id,))
            conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'message': 'Location deleted'})
