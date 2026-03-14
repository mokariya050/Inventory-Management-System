import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login({ email: form.email, password: form.password })
      login(data.access_token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-panel">
      {/* Logo */}
      <div className="text-center mb-4">
        <div className="auth-logo-ring">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="15" width="20" height="5" rx="2" fill="#575D90"/>
            <rect x="5" y="9.5" width="14" height="5" rx="2" fill="#575D90" fillOpacity="0.72"/>
            <rect x="8" y="4" width="8" height="5" rx="2" fill="#575D90" fillOpacity="0.44"/>
          </svg>
        </div>
        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subheading">Sign in to CoreInventory</p>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="fas fa-exclamation-circle flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label" htmlFor="login-email">Email address</label>
          <input
            className="form-control"
            type="email"
            id="login-email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </div>

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label className="form-label mb-0" htmlFor="login-password">Password</label>
            <Link to="/recover-password" className="small text-primary" style={{ fontWeight: 600, textDecoration: 'none', fontSize: '0.8rem' }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              className="form-control"
              type={showPwd ? 'text' : 'password'}
              id="login-password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              style={{ paddingRight: 40 }}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              tabIndex={-1}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}
            >
              <i className={showPwd ? 'fas fa-eye-slash' : 'fas fa-eye'} style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>

        <button
          className="btn btn-primary w-100 btn-user"
          type="submit"
          disabled={loading}
          aria-busy={loading}
        >
          {loading
            ? <><i className="fas fa-spinner fa-spin me-2" aria-hidden="true" />Signing in…</>
            : 'Sign In'
          }
        </button>
      </form>

      <div className="auth-links">
        <span style={{ color: '#6b7280' }}>Don't have an account?</span>
        <Link to="/register">Create account</Link>
      </div>
    </div>
  )
}
