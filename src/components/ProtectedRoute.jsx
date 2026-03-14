import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_LEVELS = { admin: 3, manager: 2, staff: 1 }

/**
 * Default protected route — requires authentication only.
 * Shows nothing while auth is still loading (prevents flash-of-redirect).
 */
export default function ProtectedRoute() {
  const { isAuthenticated, authLoading } = useAuth()
  if (authLoading) return null
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

/**
 * Role-aware route guard.
 *
 * - Not authenticated  → /login
 * - No role assigned   → /pending  (waiting for role assignment)
 * - Role below minRole → /         (insufficient permissions)
 * - Otherwise          → renders children
 */
export function RoleRoute({ minRole = 'staff' }) {
  const { isAuthenticated, user, authLoading } = useAuth()

  if (authLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  const userLevel = ROLE_LEVELS[user?.role] || 0
  const minLevel  = ROLE_LEVELS[minRole]    || 1

  if (userLevel === 0)          return <Navigate to="/pending" replace />
  if (userLevel < minLevel)     return <Navigate to="/"        replace />

  return <Outlet />
}
