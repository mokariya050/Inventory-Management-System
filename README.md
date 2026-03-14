<p align="center">
  <h1 align="center">📦 CoreInventory</h1>
  <p align="center">
    A modern, full-stack Inventory Management System built with <strong>React</strong> &amp; <strong>Flask</strong>.
    <br />
    Track products, manage warehouses, process receipts &amp; deliveries, and monitor stock — all from a beautiful dashboard.
  </p>
</p>

---

## ✨ Features

| Area | Highlights |
|------|-----------|
| **Dashboard** | KPI cards (revenue, orders, earnings), stock-by-category chart (Chart.js), low-stock alerts |
| **Products** | Full CRUD with SKU, category, unit-of-measure, and minimum-stock thresholds |
| **Warehouse Operations** | Receipts · Deliveries · Transfers · Adjustments — each with draft → ready → done workflow |
| **Stock Tracking** | Real-time stock levels per location, full stock ledger with move history |
| **Warehouses & Locations** | Multi-warehouse support with named locations (shelves, docks, zones) |
| **Suppliers & Categories** | Manage supplier contacts and product category taxonomy |
| **User Management** | Admin panel to assign roles and manage user accounts |
| **Authentication** | JWT-based login, OTP email verification for registration & password reset |
| **Role-Based Access** | Four tiers — `admin` · `manager` · `staff` · *(no role / pending)* |
| **Notifications & Messages** | In-app notification bell and message inbox |
| **Profile** | Editable avatar, contact info, and password change |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite for fast HMR and builds
- **React Router v7** — client-side routing with protected & role-gated routes
- **Bootstrap 5** — responsive layout and UI components
- **Chart.js** + react-chartjs-2 — interactive dashboard charts
- **Font Awesome** — icon library
- **react-hot-toast** — toast notifications
- **Nunito** (Google Fonts) — typography

### Backend
- **Flask 3.1** — Python micro-framework
- **Flask-JWT-Extended** — token authentication
- **Flask-CORS** — cross-origin requests
- **PyMySQL** — MySQL database driver
- **Werkzeug** — password hashing (scrypt)
- **python-dotenv** — environment variable management

### Database
- **MySQL 8+** — relational database with utf8mb4 support

---

## 📁 Project Structure

```
Inventory-Management-System/
├── backend/                    # Flask API server
│   ├── app.py                  # Application factory & blueprint registration
│   ├── db.py                   # MySQL connection helper (PyMySQL)
│   ├── schema.sql              # Full DB schema + seed data
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variable template
│   ├── routes/                 # API route blueprints
│   │   ├── auth.py             #   Login, register, OTP, password reset
│   │   ├── dashboard.py        #   Dashboard stats & charts
│   │   ├── products.py         #   Product CRUD
│   │   ├── categories.py       #   Category CRUD
│   │   ├── suppliers.py        #   Supplier CRUD
│   │   ├── warehouses.py       #   Warehouse & location management
│   │   ├── receipts.py         #   Goods receipt operations
│   │   ├── deliveries.py       #   Delivery order operations
│   │   ├── transfers.py        #   Inter-location transfers
│   │   ├── adjustments.py      #   Inventory adjustments
│   │   ├── stock.py            #   Stock levels & ledger queries
│   │   ├── users.py            #   Profile & password management
│   │   ├── admin.py            #   User role assignment & deletion
│   │   ├── notifications.py    #   Notification feed
│   │   └── messages.py         #   Message inbox
│   └── utils/
│       ├── email.py            # OTP generation & SMTP sending
│       ├── ref.py              # Reference number generator
│       └── roles.py            # Role hierarchy & decorators
│
├── src/                        # React frontend
│   ├── App.jsx                 # Root component & route definitions
│   ├── main.jsx                # Entry point
│   ├── context/                # React contexts
│   │   ├── AuthContext.jsx     #   Auth state & token management
│   │   └── SidebarContext.jsx  #   Sidebar toggle state
│   ├── components/             # Shared components
│   │   ├── Sidebar.jsx         #   Navigation sidebar
│   │   ├── Topbar.jsx          #   Top navigation bar
│   │   ├── ProductModal.jsx    #   Product create/edit modal
│   │   ├── ProtectedRoute.jsx  #   Auth & role-gated route wrappers
│   │   └── Footer.jsx          #   Page footer
│   ├── layouts/                # Page layout wrappers
│   │   ├── DashboardLayout.jsx #   Sidebar + topbar layout
│   │   └── AuthLayout.jsx      #   Minimal auth page layout
│   ├── pages/                  # Page components
│   │   ├── Dashboard.jsx       #   Main dashboard
│   │   ├── Products.jsx        #   Product list & management
│   │   ├── Profile.jsx         #   User profile editor
│   │   ├── MoveHistory.jsx     #   Stock ledger / move log
│   │   ├── Pending.jsx         #   "Awaiting role" landing page
│   │   ├── Login.jsx           #   Login form
│   │   ├── Register.jsx        #   Registration with OTP
│   │   ├── RecoverPassword.jsx #   Password reset with OTP
│   │   ├── operations/         #   Warehouse operation pages
│   │   ├── settings/           #   Warehouse settings
│   │   └── admin/              #   Admin user management
│   ├── services/
│   │   └── api.js              # Centralized API client (fetch wrapper)
│   └── styles/                 # CSS stylesheets
│       ├── app.css             #   Custom application styles
│       ├── bootstrap-theme.min.css  # Bootstrap theme
│       └── bss-overrides.css   #   Bootstrap overrides
│
├── index.html                  # HTML entry point
├── vite.config.js              # Vite configuration
├── package.json                # Node.js dependencies & scripts
└── .env                        # Frontend env vars (VITE_API_URL)
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| **Node.js** | v18 or later |
| **npm** | v9 or later |
| **Python** | 3.10 or later |
| **MySQL** | 8.0 or later |

---

### 1 · Clone the repository

```bash
git clone https://github.com/mokariya050/Inventory-Management-System.git
cd Inventory-Management-System
```

### 2 · Set up the database

Start your MySQL server, then import the schema (creates the `inventory_db` database, all tables, and seed data):

```bash
mysql -u root -p < backend/schema.sql
```

> **Seed account:** `admin@brand.com` / `admin123` (role: `admin`)

### 3 · Configure the backend

```bash
cd backend

# Copy the example env file and edit it with your MySQL credentials
cp .env.example .env
```

Open `backend/.env` and update these values to match your MySQL setup:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DB=inventory_db
JWT_SECRET_KEY=your-secret-key

# Optional: SMTP config for OTP emails (leave blank to print OTPs to console)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
```

### 4 · Install & run the backend

```bash
# Still in the backend/ directory
pip install -r requirements.txt

python app.py
```

The Flask API server will start on **http://localhost:3000**.

### 5 · Install & run the frontend

Open a **new terminal** in the project root:

```bash
# From the project root
npm install

npm run dev
```

The Vite dev server will start on **http://localhost:5173**.

### 6 · Open the app

Navigate to **http://localhost:5173** in your browser and log in with:

| Field | Value |
|-------|-------|
| Email | `admin@brand.com` |
| Password | `admin123` |

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    REGISTRATION                         │
│  1. User enters name, email, username, password         │
│  2. Click "Send OTP" → 6-digit code sent via email     │
│  3. Enter OTP + submit → account created (no role yet)  │
│  4. Redirected to /pending until admin assigns a role   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   PASSWORD RESET                        │
│  1. Navigate to /recover-password                       │
│  2. Enter email → receive OTP                           │
│  3. Enter OTP + new password → password updated         │
└─────────────────────────────────────────────────────────┘
```

---

## 👥 Role Hierarchy

| Role | Access Level |
|------|-------------|
| *(no role)* | Profile only — sees the "Pending" page until assigned a role |
| **staff** | Dashboard, products, all warehouse operations, move history |
| **manager** | Everything staff can do + warehouse & location settings |
| **admin** | Full access including user management (assign roles, delete users) |

---

## 📦 Warehouse Operations

All four operation types follow the same lifecycle:

```
  draft  →  ready  →  done
                  ↘  canceled
```

| Operation | Purpose |
|-----------|---------|
| **Receipts** | Receive goods from a supplier into a warehouse location |
| **Deliveries** | Ship goods to a customer from a warehouse location |
| **Transfers** | Move stock between two warehouse locations |
| **Adjustments** | Reconcile system stock with physical counts |

Each validated operation automatically updates **stock levels** and records entries in the **stock ledger** for full traceability.

---

## 🗄️ API Endpoints

All endpoints are prefixed with `/api`.

| Group | Prefix | Key Endpoints |
|-------|--------|---------------|
| Auth | `/api/auth` | `POST /login`, `POST /register`, `POST /send-otp`, `POST /reset-password` |
| Dashboard | `/api/dashboard` | `GET /stats`, `GET /stock-by-category`, `GET /low-stock` |
| Products | `/api/products` | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| Categories | `/api/categories` | `GET /`, `POST /`, `PUT /:id`, `DELETE /:id` |
| Suppliers | `/api/suppliers` | `GET /`, `POST /`, `PUT /:id` |
| Warehouses | `/api/warehouses` | `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`, `GET /:id/locations` |
| Receipts | `/api/receipts` | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `POST /:id/validate` |
| Deliveries | `/api/deliveries` | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `POST /:id/validate` |
| Transfers | `/api/transfers` | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `POST /:id/validate` |
| Adjustments | `/api/adjustments` | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `POST /:id/validate` |
| Stock | `/api/stock` | `GET /levels`, `GET /ledger` |
| Users | `/api/users` | `GET /me`, `PUT /me`, `PUT /me/contact`, `PUT /me/password` |
| Admin | `/api/admin` | `GET /users`, `PUT /users/:id/role`, `DELETE /users/:id` |
| Notifications | `/api` | `GET /notifications` |
| Messages | `/api` | `GET /messages/inbox` |

> All endpoints except auth routes require a valid JWT `Authorization: Bearer <token>` header.

---

## 🧪 Quick Verification

After completing setup, verify everything works:

1. **Backend health** — Open http://localhost:3000/api/dashboard/stats in your browser (should return `401 Unauthorized` — this confirms the API is running).

2. **Frontend** — Open http://localhost:5173 and log in with `admin@brand.com` / `admin123`.

3. **Dashboard** — You should see KPI cards, a stock-by-category doughnut chart, and a low-stock alerts table.

4. **Products** — Navigate to *Products* in the sidebar → you should see the 10 seeded products.

5. **Create a receipt** — Go to *Operations → Receipts → New* → select a supplier, location, and add product lines → Save → Validate → stock levels update automatically.

---

## 🏗️ Building for Production

```bash
# Build the React frontend
npm run build

# Output is in the dist/ directory — serve with any static file server
npm run preview   # Preview the production build locally
```

For the backend, use a production WSGI server:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:3000 "app:create_app()"
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/mokariya050">mokariya050</a>
</p>