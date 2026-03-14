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
  // Auth
  login:         (body) => request('/api/auth/login',          { method: 'POST', body: JSON.stringify(body) }),
  register:      (body) => request('/api/auth/register',       { method: 'POST', body: JSON.stringify(body) }),
  sendOtp:       (body) => request('/api/auth/send-otp',       { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),

  // Dashboard
  getDashboardStats: () => request('/api/dashboard/stats'),
  getEarnings:       () => request('/api/dashboard/earnings'),
  getRevenueSources: () => request('/api/dashboard/revenue-sources'),

  // Data
  getProjects:  ()       => request('/api/projects'),
  getTasks:     ()       => request('/api/tasks'),
  getEmployees: (params) => request(`/api/employees?${new URLSearchParams(params)}`),

  // User
  getMe:         ()     => request('/api/users/me'),
  updateMe:      (body) => request('/api/users/me',         { method: 'PUT', body: JSON.stringify(body) }),
  updateContact: (body) => request('/api/users/me/contact', { method: 'PUT', body: JSON.stringify(body) }),

  // Notifications & Messages
  getNotifications: () => request('/api/notifications'),
  getInbox:         () => request('/api/messages/inbox'),
}
