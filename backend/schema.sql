-- CoreInventory – Inventory Management System
-- Full schema (safe to re-run: uses IF NOT EXISTS / INSERT IGNORE)
-- Run: mysql -u root -p < backend/schema.sql

CREATE DATABASE IF NOT EXISTS inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inventory_db;

-- ─────────────────────────────────────────────────────────────────
-- KEEP: Auth & UI tables
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(80)  NOT NULL UNIQUE,
    email         VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    name          VARCHAR(120),
    role          VARCHAR(80),
    address       VARCHAR(200),
    city          VARCHAR(80),
    country       VARCHAR(80),
    avatar_url    VARCHAR(300) DEFAULT '/assets/img/avatars/avatar1.jpeg',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_tokens (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(120) NOT NULL,
    otp_code   VARCHAR(10)  NOT NULL,
    purpose    VARCHAR(20)  NOT NULL,
    expires_at DATETIME     NOT NULL,
    used       TINYINT(1)   DEFAULT 0,
    created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_purpose (email, purpose)
);

CREATE TABLE IF NOT EXISTS notifications (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    message    TEXT NOT NULL,
    icon       VARCHAR(60)  DEFAULT 'fas fa-file-alt',
    icon_bg    VARCHAR(30)  DEFAULT 'bg-primary',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read    TINYINT(1)   DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    sender_name   VARCHAR(120) NOT NULL,
    sender_avatar VARCHAR(300) DEFAULT '/assets/img/avatars/avatar1.jpeg',
    preview       TEXT,
    sent_at       VARCHAR(20),
    is_read       TINYINT(1)   DEFAULT 0,
    online_status VARCHAR(20)  DEFAULT 'offline'
);

-- ─────────────────────────────────────────────────────────────────
-- NEW: Inventory master data
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_categories (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(80) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(120) NOT NULL,
    contact_email VARCHAR(120),
    phone         VARCHAR(40),
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warehouses (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(120) NOT NULL,
    short_code VARCHAR(10)  NOT NULL UNIQUE,
    address    VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id INT NOT NULL,
    name         VARCHAR(80) NOT NULL,
    code         VARCHAR(20) NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_wh_code (warehouse_id, code),
    CONSTRAINT fk_loc_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    sku              VARCHAR(60)  NOT NULL UNIQUE,
    name             VARCHAR(120) NOT NULL,
    category_id      INT,
    unit_of_measure  VARCHAR(30)  DEFAULT 'unit',
    min_stock        INT          DEFAULT 0,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────────
-- NEW: Stock accounting
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stock_levels (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    product_id  INT NOT NULL,
    location_id INT NOT NULL,
    qty         INT NOT NULL DEFAULT 0,
    UNIQUE KEY uq_product_location (product_id, location_id),
    CONSTRAINT fk_sl_product  FOREIGN KEY (product_id)  REFERENCES products(id)  ON DELETE CASCADE,
    CONSTRAINT fk_sl_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stock_ledger (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    product_id       INT NOT NULL,
    from_location_id INT,
    to_location_id   INT,
    qty_change       INT NOT NULL,
    operation_type   ENUM('receipt','delivery','transfer','adjustment') NOT NULL,
    reference_id     INT,
    reference_type   VARCHAR(20),
    created_by       INT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ledger_product  FOREIGN KEY (product_id)       REFERENCES products(id)   ON DELETE CASCADE,
    CONSTRAINT fk_ledger_from     FOREIGN KEY (from_location_id) REFERENCES locations(id)  ON DELETE SET NULL,
    CONSTRAINT fk_ledger_to       FOREIGN KEY (to_location_id)   REFERENCES locations(id)  ON DELETE SET NULL,
    CONSTRAINT fk_ledger_user     FOREIGN KEY (created_by)       REFERENCES users(id)      ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────────
-- NEW: Operational documents
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS receipts (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    ref          VARCHAR(40) NOT NULL UNIQUE,
    supplier_id  INT,
    location_id  INT NOT NULL,
    status       ENUM('draft','ready','done','canceled') DEFAULT 'draft',
    notes        TEXT,
    created_by   INT,
    validated_at DATETIME,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rec_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    CONSTRAINT fk_rec_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_rec_user     FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS receipt_lines (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    receipt_id   INT NOT NULL,
    product_id   INT NOT NULL,
    qty_expected INT DEFAULT 0,
    qty_done     INT DEFAULT 0,
    CONSTRAINT fk_rl_receipt FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
    CONSTRAINT fk_rl_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS deliveries (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    ref           VARCHAR(40) NOT NULL UNIQUE,
    customer_name VARCHAR(120),
    location_id   INT NOT NULL,
    status        ENUM('draft','ready','done','canceled') DEFAULT 'draft',
    notes         TEXT,
    created_by    INT,
    validated_at  DATETIME,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_del_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_del_user     FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS delivery_lines (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    delivery_id  INT NOT NULL,
    product_id   INT NOT NULL,
    qty_ordered  INT DEFAULT 0,
    qty_done     INT DEFAULT 0,
    CONSTRAINT fk_dl_delivery FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    CONSTRAINT fk_dl_product  FOREIGN KEY (product_id)  REFERENCES products(id)  ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS transfers (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    ref              VARCHAR(40) NOT NULL UNIQUE,
    from_location_id INT NOT NULL,
    to_location_id   INT NOT NULL,
    status           ENUM('draft','ready','done','canceled') DEFAULT 'draft',
    notes            TEXT,
    created_by       INT,
    validated_at     DATETIME,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tr_from FOREIGN KEY (from_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_tr_to   FOREIGN KEY (to_location_id)   REFERENCES locations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_tr_user FOREIGN KEY (created_by)       REFERENCES users(id)     ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS transfer_lines (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    transfer_id INT NOT NULL,
    product_id  INT NOT NULL,
    qty         INT DEFAULT 0,
    CONSTRAINT fk_tl_transfer FOREIGN KEY (transfer_id) REFERENCES transfers(id) ON DELETE CASCADE,
    CONSTRAINT fk_tl_product  FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS adjustments (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    ref          VARCHAR(40) NOT NULL UNIQUE,
    location_id  INT NOT NULL,
    status       ENUM('draft','ready','done','canceled') DEFAULT 'draft',
    notes        TEXT,
    created_by   INT,
    validated_at DATETIME,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_adj_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_adj_user     FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS adjustment_lines (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    adjustment_id INT NOT NULL,
    product_id    INT NOT NULL,
    qty_system    INT DEFAULT 0,
    qty_counted   INT DEFAULT 0,
    CONSTRAINT fk_al_adjustment FOREIGN KEY (adjustment_id) REFERENCES adjustments(id) ON DELETE CASCADE,
    CONSTRAINT fk_al_product    FOREIGN KEY (product_id)    REFERENCES products(id)    ON DELETE RESTRICT
);

-- ─────────────────────────────────────────────────────────────────
-- Seed Data  (INSERT IGNORE = safe to re-run)
-- ─────────────────────────────────────────────────────────────────

-- Admin user (password: admin123)
INSERT IGNORE INTO users (username, email, password_hash, name, role, address, city, country, avatar_url) VALUES
('admin', 'admin@brand.com',
 'scrypt:32768:8:1$thv4DPRWdbnWJGBw$5431048b496e1e06c2250990511082639c8a32bddc9038e9deb0230cf5d11f6285a52ccbe714abd7827760f1bfaef813406fa13f53bd5f82776b56bc701ec6f7',
 'Valerie Luna', 'Administrator', 'Sunset Blvd, 38', 'Los Angeles', 'USA',
 '/assets/img/avatars/avatar1.jpeg');

-- Notifications
INSERT IGNORE INTO notifications (id, message, icon, icon_bg, created_at) VALUES
(1, 'Stock alert: Wireless Keyboard is running low!',         'fas fa-exclamation-triangle', 'bg-warning', NOW()),
(2, 'Receipt REC-SEED-0001 has been validated successfully.', 'fas fa-check-circle',          'bg-success', NOW()),
(3, 'New delivery order created for Customer ABC.',           'fas fa-truck',                 'bg-primary', NOW());

-- Messages
INSERT IGNORE INTO messages (id, sender_name, sender_avatar, preview, sent_at, online_status) VALUES
(1, 'Emily Fowler',    '/assets/img/avatars/avatar4.jpeg', 'Hi there! Can you help me with a stock inquiry?',                        '58m', 'online'),
(2, 'Jae Chun',        '/assets/img/avatars/avatar2.jpeg', 'The receipt for last month''s order is ready to validate.',              '1d',  'offline'),
(3, 'Morgan Alvarez',  '/assets/img/avatars/avatar3.jpeg', 'Inventory report looks great, keep up the good work!',                   '2d',  'away'),
(4, 'Chicken the Dog', '/assets/img/avatars/avatar5.jpeg', 'Am I a good warehouse manager? People keep saying yes to all managers.', '2w',  'online');

-- Warehouses
INSERT IGNORE INTO warehouses (id, name, short_code, address) VALUES
(1, 'Main Warehouse',      'MAIN', '100 Industrial Ave, Los Angeles, CA'),
(2, 'Secondary Warehouse', 'SEC',  '200 Storage Blvd, Los Angeles, CA');

-- Locations (2 per warehouse)
INSERT IGNORE INTO locations (id, warehouse_id, name, code) VALUES
(1, 1, 'Main Shelf',      'MAIN-A'),
(2, 1, 'Receiving Dock',  'MAIN-RECV'),
(3, 2, 'Secondary Shelf', 'SEC-B'),
(4, 2, 'Overflow Zone',   'SEC-OVF');

-- Product categories
INSERT IGNORE INTO product_categories (id, name) VALUES
(1, 'Electronics'),
(2, 'Furniture'),
(3, 'Stationery'),
(4, 'Apparel');

-- Suppliers
INSERT IGNORE INTO suppliers (id, name, contact_email, phone) VALUES
(1, 'TechSupply Co',  'orders@techsupply.com',  '+1-800-555-0101'),
(2, 'OfficePro Ltd',  'sales@officepro.com',    '+1-800-555-0202'),
(3, 'Fashion World',  'supply@fashionworld.com', '+1-800-555-0303');

-- Products
INSERT IGNORE INTO products (id, sku, name, category_id, unit_of_measure, min_stock) VALUES
(1,  'ELEC-001', 'Laptop Pro 15"',         1, 'unit', 5),
(2,  'ELEC-002', 'Wireless Keyboard',      1, 'unit', 10),
(3,  'ELEC-003', 'USB-C Hub',              1, 'unit', 15),
(4,  'FURN-001', 'Office Chair',           2, 'unit', 3),
(5,  'FURN-002', 'Standing Desk',          2, 'unit', 2),
(6,  'STAT-001', 'Ballpoint Pens (box)',   3, 'box',  20),
(7,  'STAT-002', 'A4 Paper Ream',          3, 'ream', 50),
(8,  'STAT-003', 'Sticky Notes Pack',      3, 'pack', 30),
(9,  'APRL-001', 'Company T-Shirt (M)',    4, 'unit', 25),
(10, 'APRL-002', 'Safety Vest',            4, 'unit', 10);

-- Initial stock levels (direct seed — no ledger entries for seed data)
-- 1=MAIN-A, 2=MAIN-RECV, 3=SEC-B, 4=SEC-OVF
INSERT IGNORE INTO stock_levels (product_id, location_id, qty) VALUES
(1,  1, 8),   -- Laptop Pro 15"       : 8  (OK, min=5)
(2,  1, 6),   -- Wireless Keyboard    : 6  (LOW, min=10)
              -- USB-C Hub            : 0  (OUT OF STOCK, min=15)
(4,  1, 5),   -- Office Chair         : 5  (OK, min=3)
(5,  1, 3),   -- Standing Desk        : 3  (OK, min=2)
(6,  1, 45),  -- Ballpoint Pens       : 45 (OK, min=20)
(7,  1, 80),  -- A4 Paper Ream        : 80 (OK, min=50)
(8,  1, 12),  -- Sticky Notes Pack    : 12 (LOW, min=30)
(9,  1, 30),  -- Company T-Shirt (M)  : 30 (OK, min=25)
(10, 3, 3);   -- Safety Vest          : 3  (LOW, min=10)
