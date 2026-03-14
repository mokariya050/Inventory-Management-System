import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', user_id: '', email: '', password: '', password_repeat: '' })
  const [otp, setOtp]   = useState('')
  const [error, setError]   = useState('')
  const [info, setInfo]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd]           = useState(false)
  const [showPwdRepeat, setShowPwdRepeat] = useState(false)
  const [resendTimer, setResendTimer]   = useState(0)

  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [resendTimer])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.user_id || !form.email || !form.password || !form.password_repeat) {
      setError('All fields are required'); return
    }
    if (form.password !== form.password_repeat) {
      setError('Passwords do not match'); return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters'); return
    }
    setLoading(true)
    try {
      await api.sendOtp({ email: form.email, purpose: 'register' })
      setInfo(`A 6-digit code was sent to ${form.email}`)
      setResendTimer(60)
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP'); return }
    setLoading(true)
    try {
      const data = await api.register({ ...form, otp })
      login(data.access_token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setLoading(true)
    try {
      await api.sendOtp({ email: form.email, purpose: 'register' })
      setInfo(`Code resent to ${form.email}`)
      setResendTimer(60)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const PwdToggle = ({ show, onToggle, label }) => (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={label}
      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}
    >
      <i className={show ? 'fas fa-eye-slash' : 'fas fa-eye'} style={{ fontSize: 14 }} />
    </button>
  )

  return (
    <div className="auth-panel" style={{ maxWidth: 520 }}>
      {/* Logo */}
      <div className="text-center mb-4">
        <div className="auth-logo-ring">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="15" width="20" height="5" rx="2" fill="#575D90"/>
            <rect x="5" y="9.5" width="14" height="5" rx="2" fill="#575D90" fillOpacity="0.72"/>
            <rect x="8" y="4" width="8" height="5" rx="2" fill="#575D90" fillOpacity="0.44"/>
          </svg>
        </div>
        <h1 className="auth-heading">
          {step === 1 ? 'Create an account' : 'Check your email'}
        </h1>
        <p className="auth-subheading">
          {step === 1 ? 'Join CoreInventory today' : `We sent a code to ${form.email}`}
        </p>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
          <i className="fas fa-exclamation-circle flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      {info && step === 2 && (
        <div className="alert alert-info d-flex align-items-center gap-2 mb-3" role="status">
          <i className="fas fa-envelope flex-shrink-0" aria-hidden="true" />
          <span>{info}</span>
        </div>
      )}

      {/* ── Step 1: Account details ── */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} noValidate>
          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label className="form-label" htmlFor="reg-name">Full name</label>
              <input className="form-control" id="reg-name" type="text" name="name"
                placeholder="Jane Smith" value={form.name} onChange={handleChange} required />
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="reg-userid">User ID</label>
              <input className="form-control" id="reg-userid" type="text" name="user_id"
                placeholder="jane.smith" value={form.user_id} onChange={handleChange} required />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <input className="form-control" id="reg-email" type="email" name="email"
              placeholder="jane@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="row g-3 mb-4">
            <div className="col-sm-6">
              <label className="form-label" htmlFor="reg-pwd">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-control" id="reg-pwd" type={showPwd ? 'text' : 'password'}
                  name="password" placeholder="Min. 6 characters" value={form.password}
                  onChange={handleChange} style={{ paddingRight: 36 }} required />
                <PwdToggle show={showPwd} onToggle={() => setShowPwd(v => !v)}
                  label={showPwd ? 'Hide password' : 'Show password'} />
              </div>
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="reg-pwd2">Confirm password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-control" id="reg-pwd2" type={showPwdRepeat ? 'text' : 'password'}
                  name="password_repeat" placeholder="Repeat password" value={form.password_repeat}
                  onChange={handleChange} style={{ paddingRight: 36 }} required />
                <PwdToggle show={showPwdRepeat} onToggle={() => setShowPwdRepeat(v => !v)}
                  label={showPwdRepeat ? 'Hide password' : 'Show password'} />
              </div>
            </div>
          </div>
          <button className="btn btn-primary w-100 btn-user" type="submit" disabled={loading} aria-busy={loading}>
            {loading
              ? <><i className="fas fa-spinner fa-spin me-2" aria-hidden="true" />Sending code…</>
              : 'Continue'
            }
          </button>
        </form>
      )}

      {/* ── Step 2: OTP verification ── */}
      {step === 2 && (
        <form onSubmit={handleRegister} noValidate>
          <div className="mb-4">
            <label className="form-label text-center d-block" htmlFor="reg-otp">
              Verification code
            </label>
            <input
              className="form-control text-center"
              id="reg-otp"
              style={{ letterSpacing: '0.55em', fontSize: '1.5rem', fontWeight: 700, padding: '0.75rem' }}
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]{6}"
              autoFocus
              required
            />
          </div>
          <button
            className="btn btn-primary w-100 btn-user mb-3"
            type="submit"
            disabled={loading || otp.length !== 6}
            aria-busy={loading}
          >
            {loading
              ? <><i className="fas fa-spinner fa-spin me-2" aria-hidden="true" />Verifying…</>
              : 'Create Account'
            }
          </button>
          <div className="d-flex justify-content-center gap-3 small">
            <button type="button" className="btn btn-link p-0 small"
              onClick={handleResend} disabled={loading || resendTimer > 0}>
              {resendTimer > 0 ? `Resend code (${resendTimer}s)` : 'Resend code'}
            </button>
            <span style={{ color: '#d1d5db' }}>·</span>
            <button type="button" className="btn btn-link p-0 small"
              onClick={() => { setStep(1); setOtp(''); setError(''); setInfo(''); setResendTimer(0) }}>
              Back
            </button>
          </div>
        </form>
      )}

      <div className="auth-links">
        <span style={{ color: '#6b7280' }}>Already have an account?</span>
        <Link to="/login">Sign in</Link>
      </div>
    </div>
  )
}
