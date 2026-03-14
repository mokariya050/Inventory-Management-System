-- Inventory Management System Database Schema
-- Run: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inventory_db;

-- ─────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(80)  NOT NULL UNIQUE,
    email        VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    name         VARCHAR(120),
    role         VARCHAR(80),
    address      VARCHAR(200),
    city         VARCHAR(80),
    country      VARCHAR(80),
    avatar_url   VARCHAR(300) DEFAULT '/assets/img/avatars/avatar1.jpeg',
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(120) NOT NULL,
    position   VARCHAR(120),
    office     VARCHAR(80),
    age        INT,
    start_date DATE,
    salary     DECIMAL(12,2),
    avatar_url VARCHAR(300) DEFAULT '/assets/img/avatars/avatar1.jpeg'
);

CREATE TABLE IF NOT EXISTS projects (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(120) NOT NULL,
    progress INT DEFAULT 0,
    color    VARCHAR(30) DEFAULT 'bg-primary'
);

CREATE TABLE IF NOT EXISTS tasks (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    title     VARCHAR(200) NOT NULL,
    due_time  VARCHAR(20),
    completed TINYINT(1) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dashboard_stats (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    monthly_earnings     DECIMAL(14,2),
    annual_earnings      DECIMAL(14,2),
    task_completion_pct  INT,
    pending_requests     INT
);

CREATE TABLE IF NOT EXISTS earnings_history (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    month_label VARCHAR(10) NOT NULL,
    amount      DECIMAL(14,2) NOT NULL,
    year        INT NOT NULL
);

CREATE TABLE IF NOT EXISTS revenue_sources (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(60) NOT NULL,
    value INT NOT NULL,
    color VARCHAR(20) DEFAULT '#4e73df'
);

CREATE TABLE IF NOT EXISTS notifications (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    message    TEXT NOT NULL,
    icon       VARCHAR(60) DEFAULT 'fas fa-file-alt',
    icon_bg    VARCHAR(30) DEFAULT 'bg-primary',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read    TINYINT(1) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    sender_name   VARCHAR(120) NOT NULL,
    sender_avatar VARCHAR(300) DEFAULT '/assets/img/avatars/avatar1.jpeg',
    preview       TEXT,
    sent_at       VARCHAR(20),
    is_read       TINYINT(1) DEFAULT 0,
    online_status VARCHAR(20) DEFAULT 'offline'
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
-- Migration note: if DB already exists, run:
--   ALTER TABLE ... or just execute this CREATE TABLE IF NOT EXISTS statement.

-- ─────────────────────────────────────────
-- Seed Data
-- ─────────────────────────────────────────

-- Admin user  (password: admin123)
INSERT INTO users (username, email, password_hash, name, role, address, city, country, avatar_url) VALUES
('admin', 'admin@brand.com',
 'scrypt:32768:8:1$thv4DPRWdbnWJGBw$5431048b496e1e06c2250990511082639c8a32bddc9038e9deb0230cf5d11f6285a52ccbe714abd7827760f1bfaef813406fa13f53bd5f82776b56bc701ec6f7',
 'Valerie Luna', 'Administrator', 'Sunset Blvd, 38', 'Los Angeles', 'USA',
 '/assets/img/avatars/avatar1.jpeg');

-- Employees
INSERT INTO employees (name, position, office, age, start_date, salary, avatar_url) VALUES
('Airi Satou',         'Accountant',                     'Tokyo',         33, '2008-11-28', 162700.00,  '/assets/img/avatars/avatar1.jpeg'),
('Angelica Ramos',     'Chief Executive Officer (CEO)',   'London',        47, '2009-10-09', 1200000.00, '/assets/img/avatars/avatar2.jpeg'),
('Ashton Cox',         'Junior Technical Author',         'San Francisco', 66, '2009-01-12', 86000.00,   '/assets/img/avatars/avatar3.jpeg'),
('Bradley Greer',      'Software Engineer',               'London',        41, '2012-10-13', 132000.00,  '/assets/img/avatars/avatar4.jpeg'),
('Brenden Wagner',     'Software Engineer',               'San Francisco', 28, '2011-06-07', 206850.00,  '/assets/img/avatars/avatar5.jpeg'),
('Brielle Williamson', 'Integration Specialist',          'New York',      61, '2012-12-02', 372000.00,  '/assets/img/avatars/avatar1.jpeg'),
('Bruno Nash',         'Software Engineer',               'London',        38, '2011-05-03', 163500.00,  '/assets/img/avatars/avatar2.jpeg'),
('Caesar Vance',       'Pre-Sales Support',               'New York',      21, '2011-12-12', 106450.00,  '/assets/img/avatars/avatar3.jpeg'),
('Cara Stevens',       'Sales Assistant',                 'New York',      46, '2011-12-06', 145600.00,  '/assets/img/avatars/avatar4.jpeg'),
('Cedric Kelly',       'Senior JavaScript Developer',     'Edinburgh',     22, '2012-03-29', 433060.00,  '/assets/img/avatars/avatar5.jpeg'),
('Charde Marshall',    'Regional Director',               'San Francisco', 36, '2008-10-16', 470600.00,  '/assets/img/avatars/avatar1.jpeg'),
('Colleen Hurst',      'Javascript Developer',            'San Francisco', 39, '2009-09-15', 205500.00,  '/assets/img/avatars/avatar2.jpeg'),
('Dai Rios',           'Personnel Lead',                  'Edinburgh',     35, '2012-09-26', 217500.00,  '/assets/img/avatars/avatar3.jpeg'),
('Donna Snider',       'Customer Support',                'New York',      27, '2011-01-25', 112000.00,  '/assets/img/avatars/avatar4.jpeg'),
('Doris Wilder',       'Sales Assistant',                 'Sidney',        23, '2010-09-20', 85600.00,   '/assets/img/avatars/avatar5.jpeg'),
('Finn Camacho',       'Support Engineer',                'San Francisco', 47, '2009-07-07', 342000.00,  '/assets/img/avatars/avatar1.jpeg'),
('Fiona Green',        'Chief Operating Officer (COO)',   'San Francisco', 48, '2010-03-11', 850000.00,  '/assets/img/avatars/avatar2.jpeg'),
('Garrett Winters',    'Accountant',                      'Tokyo',         63, '2011-07-25', 170750.00,  '/assets/img/avatars/avatar3.jpeg'),
('Gavin Cortez',       'Team Leader',                     'San Francisco', 22, '2008-10-26', 235500.00,  '/assets/img/avatars/avatar4.jpeg'),
('Gavin Joyce',        'Developer',                       'Edinburgh',     42, '2010-12-22', 92575.00,   '/assets/img/avatars/avatar5.jpeg'),
('Geneva Baldwin',     'Software Engineeneer',            'San Francisco', 42, '2010-01-28', 138575.00,  '/assets/img/avatars/avatar1.jpeg'),
('Hermione Butler',    'Regional Director',               'London',        47, '2011-03-21', 356250.00,  '/assets/img/avatars/avatar2.jpeg'),
('Herrod Chandler',    'Sales Assistant',                 'San Francisco', 59, '2012-08-06', 137500.00,  '/assets/img/avatars/avatar3.jpeg'),
('Hope Fuentes',       'Secretary',                       'San Francisco', 41, '2010-02-12', 109850.00,  '/assets/img/avatars/avatar4.jpeg'),
('Howard Hatfield',    'Office Manager',                  'San Francisco', 51, '2008-12-16', 164500.00,  '/assets/img/avatars/avatar5.jpeg'),
('Jackson Bradshaw',   'Director',                        'New York',      65, '2008-09-26', 645750.00,  '/assets/img/avatars/avatar1.jpeg'),
('Jena Gaines',        'Office Manager',                  'London',        30, '2008-12-19', 90560.00,   '/assets/img/avatars/avatar2.jpeg');

-- Projects
INSERT INTO projects (name, progress, color) VALUES
('Server migration',  20,  'bg-danger'),
('Sales tracking',    40,  'bg-warning'),
('Customer Database', 60,  'bg-primary'),
('Payout Details',    80,  'bg-info'),
('Account setup',     100, 'bg-success');

-- Tasks
INSERT INTO tasks (title, due_time, completed) VALUES
('Lunch meeting', '10:30 AM', 0),
('Lunch meeting', '11:30 AM', 0),
('Lunch meeting', '12:30 AM', 0);

-- Dashboard stats
INSERT INTO dashboard_stats (monthly_earnings, annual_earnings, task_completion_pct, pending_requests) VALUES
(40000.00, 215000.00, 50, 18);

-- Earnings history
INSERT INTO earnings_history (month_label, amount, year) VALUES
('Jan', 0,     2025),
('Feb', 10000, 2025),
('Mar', 5000,  2025),
('Apr', 15000, 2025),
('May', 10000, 2025),
('Jun', 20000, 2025),
('Jul', 15000, 2025),
('Aug', 25000, 2025);

-- Revenue sources
INSERT INTO revenue_sources (label, value, color) VALUES
('Direct',   50, '#4e73df'),
('Social',   30, '#1cc88a'),
('Referral', 15, '#36b9cc');

-- Notifications
INSERT INTO notifications (message, icon, icon_bg, created_at) VALUES
('A new monthly report is ready to download!',                           'fas fa-file-alt',          'bg-primary', '2019-12-12 09:00:00'),
('$290.29 has been deposited into your account!',                        'fas fa-donate',            'bg-success', '2019-12-07 14:30:00'),
('Spending Alert: We''ve noticed unusually high spending for your account.', 'fas fa-exclamation-triangle', 'bg-warning', '2019-12-02 11:15:00');

-- Messages
INSERT INTO messages (sender_name, sender_avatar, preview, sent_at, online_status) VALUES
('Emily Fowler',   '/assets/img/avatars/avatar4.jpeg', 'Hi there! I am wondering if you can help me with a problem I''ve been having.', '58m', 'online'),
('Jae Chun',       '/assets/img/avatars/avatar2.jpeg', 'I have the photos that you ordered last month!',                                   '1d',  'offline'),
('Morgan Alvarez', '/assets/img/avatars/avatar3.jpeg', 'Last month''s report looks great, I am very happy with the progress so far, keep up the good work!', '2d', 'away'),
('Chicken the Dog','/assets/img/avatars/avatar5.jpeg', 'Am I a good boy? The reason I ask is because someone told me that people say this to all dogs, even if they aren''t good...', '2w', 'online');
