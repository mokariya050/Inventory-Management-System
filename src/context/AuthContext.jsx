import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

const ROLE_LEVELS = { admin: 3, manager: 2, staff: 1 }

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') }
    catch { return null }
  })
  // True while waiting for a fresh user record (including role) from the server.
  // Prevents routing decisions based on stale localStorage data.
  const [authLoading, setAuthLoading] = useState(() => !!localStorage.getItem('access_token'))

  // Re-fetch the user object every time the token changes (on login, on mount with
  // an existing session, etc.).  This guarantees user.role is always authoritative
  // and handles the case where the login endpoint didn't return a role yet.
  useEffect(() => {
    if (!token) {
      setAuthLoading(false)
      return
    }

    setAuthLoading(true)
    api.getMe()
      .then((fullUser) => {
        // Batch both updates in the same .then() so they render together
        setUser((prev) => {
          const updated = { ...prev, ...fullUser }
          localStorage.setItem('user', JSON.stringify(updated))
          return updated
        })
        setAuthLoading(false)
      })
      .catch(() => {
        // Token may be invalid; let the 401 handler in api.js clear it and
        // redirect to /login.  Stop loading regardless so the UI isn't stuck.
        setAuthLoading(false)
      })
  }, [token]) // re-runs on every login / token change

  const login = useCallback((accessToken, userData) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(accessToken)
    setUser(userData)
    // NOTE: the useEffect above will fire because token changed, call getMe(),
    // and ensure user.role is up-to-date even if the login response lacked it.
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  /** Returns true if the current user has at least `minRole` level. */
  const hasRole = useCallback((minRole) => {
    return (ROLE_LEVELS[user?.role] || 0) >= (ROLE_LEVELS[minRole] || 0)
  }, [user?.role])

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, authLoading, login, logout, updateUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
