const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function getToken() {
  return localStorage.getItem('access_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    window.location.href = '/login'
    return
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }

  return data
}

export const api = {
  // ── Auth ────────────────────────────────────────────────────────
  login:         (body) => request('/api/auth/login',          { method: 'POST', body: JSON.stringify(body) }),
  register:      (body) => request('/api/auth/register',       { method: 'POST', body: JSON.stringify(body) }),
  sendOtp:       (body) => request('/api/auth/send-otp',       { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),

  // ── Dashboard ───────────────────────────────────────────────────
  getDashboardStats:           () => request('/api/dashboard/stats'),
  getDashboardStockByCategory: () => request('/api/dashboard/stock-by-category'),
  getLowStock:                 () => request('/api/dashboard/low-stock'),

  // ── Products ────────────────────────────────────────────────────
  getProducts:   (params = {}) => request(`/api/products?${new URLSearchParams(params)}`),
  createProduct: (body)        => request('/api/products',        { method: 'POST', body: JSON.stringify(body) }),
  getProduct:    (id)          => request(`/api/products/${id}`),
  updateProduct: (id, body)    => request(`/api/products/${id}`,  { method: 'PUT',  body: JSON.stringify(body) }),
  deleteProduct: (id)          => request(`/api/products/${id}`,  { method: 'DELETE' }),

  // ── Categories ──────────────────────────────────────────────────
  getCategories:  ()       => request('/api/categories'),
  createCategory: (body)   => request('/api/categories',       { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id, b)  => request(`/api/categories/${id}`, { method: 'PUT',  body: JSON.stringify(b) }),
  deleteCategory: (id)     => request(`/api/categories/${id}`, { method: 'DELETE' }),

  // ── Suppliers ───────────────────────────────────────────────────
  getSuppliers:   ()       => request('/api/suppliers'),
  createSupplier: (body)   => request('/api/suppliers',        { method: 'POST', body: JSON.stringify(body) }),
  updateSupplier: (id, b)  => request(`/api/suppliers/${id}`,  { method: 'PUT',  body: JSON.stringify(b) }),

  // ── Warehouses & Locations ──────────────────────────────────────
  getWarehouses:   ()         => request('/api/warehouses'),
  createWarehouse: (body)     => request('/api/warehouses',                   { method: 'POST',   body: JSON.stringify(body) }),
  updateWarehouse: (id, body) => request(`/api/warehouses/${id}`,             { method: 'PUT',    body: JSON.stringify(body) }),
  deleteWarehouse: (id)       => request(`/api/warehouses/${id}`,             { method: 'DELETE' }),
  getLocations:    (whId)     => request(`/api/warehouses/${whId}/locations`),
  createLocation:  (whId, b)  => request(`/api/warehouses/${whId}/locations`, { method: 'POST',   body: JSON.stringify(b) }),
  deleteLocation:  (id)       => request(`/api/warehouses/locations/${id}`,   { method: 'DELETE' }),

  // ── Operations (type = 'receipts'|'deliveries'|'transfers'|'adjustments') ──
  getOperations:     (type, params = {}) => request(`/api/${type}?${new URLSearchParams(params)}`),
  createOperation:   (type, body)        => request(`/api/${type}`,              { method: 'POST',   body: JSON.stringify(body) }),
  getOperation:      (type, id)          => request(`/api/${type}/${id}`),
  updateOperation:   (type, id, body)    => request(`/api/${type}/${id}`,         { method: 'PUT',    body: JSON.stringify(body) }),
  deleteOperation:   (type, id)          => request(`/api/${type}/${id}`,         { method: 'DELETE' }),
  validateOperation: (type, id)          => request(`/api/${type}/${id}/validate`,{ method: 'POST' }),

  // ── Stock ────────────────────────────────────────────────────────
  getStockLedger: (params = {}) => request(`/api/stock/ledger?${new URLSearchParams(params)}`),
  getStockLevels: (params = {}) => request(`/api/stock/levels?${new URLSearchParams(params)}`),

  // ── User ─────────────────────────────────────────────────────────
  getMe:         ()     => request('/api/users/me'),
  updateMe:      (body) => request('/api/users/me',         { method: 'PUT', body: JSON.stringify(body) }),
  updateContact: (body) => request('/api/users/me/contact', { method: 'PUT', body: JSON.stringify(body) }),

  // ── Notifications & Messages ─────────────────────────────────────
  getNotifications: () => request('/api/notifications'),
  getInbox:         () => request('/api/messages/inbox'),
}
