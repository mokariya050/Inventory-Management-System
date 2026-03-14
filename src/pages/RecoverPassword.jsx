import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

export default function RecoverPassword() {
  const [step, setStep]   = useState(1) // 1=email, 2=otp+new-password, 3=success
  const [email, setEmail] = useState('')
  const [otp, setOtp]     = useState('')
  const [passwords, setPasswords] = useState({ new_password: '', confirm_password: '' })
  const [info, setInfo]   = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNewPwd, setShowNewPwd]         = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [resendTimer, setResendTimer]       = useState(0)

  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [resendTimer])

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)
    try {
      const data = await api.sendOtp({ email, purpose: 'reset' })
      setInfo(data.message)
      setResendTimer(60)
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError(''); setLoading(true)
    try {
      const data = await api.sendOtp({ email, purpose: 'reset' })
      setInfo(data.message)
      setResendTimer(60)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) { setError('Please enter the 6-digit code'); return }
    if (passwords.new_password !== passwords.confirm_password) { setError('Passwords do not match'); return }
    if (passwords.new_password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const data = await api.resetPassword({ email, otp, ...passwords })
      setInfo(data.message)
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const PwdToggle = ({ show, onToggle, label }) => (
    <button type="button" onClick={onToggle} tabIndex={-1} aria-label={label}
      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>
      <i className={show ? 'fas fa-eye-slash' : 'fas fa-eye'} style={{ fontSize: 14 }} />
    </button>
  )

  const stepTitles = {
    1: { heading: 'Reset password',    sub: 'Enter your email to receive a code' },
    2: { heading: 'Check your email',  sub: `We sent a code to ${email}` },
    3: { heading: 'Password updated',  sub: 'Your password has been changed' },
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
        <h1 className="auth-heading">{stepTitles[step].heading}</h1>
        <p className="auth-subheading">{stepTitles[step].sub}</p>
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

      {/* ── Step 1: Email ── */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} noValidate>
          <div className="mb-4">
            <label className="form-label" htmlFor="recover-email">Email address</label>
            <input
              className="form-control"
              id="recover-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <button className="btn btn-primary w-100 btn-user" type="submit" disabled={loading} aria-busy={loading}>
            {loading
              ? <><i className="fas fa-spinner fa-spin me-2" aria-hidden="true" />Sending code…</>
              : 'Send Reset Code'
            }
          </button>
        </form>
      )}

      {/* ── Step 2: OTP + new password ── */}
      {step === 2 && (
        <form onSubmit={handleReset} noValidate>
          <div className="mb-3">
            <label className="form-label text-center d-block" htmlFor="recover-otp">Verification code</label>
            <input
              className="form-control text-center"
              id="recover-otp"
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
          <div className="mb-3">
            <label className="form-label" htmlFor="recover-newpwd">New password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-control" id="recover-newpwd"
                type={showNewPwd ? 'text' : 'password'} placeholder="Min. 6 characters"
                value={passwords.new_password}
                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                style={{ paddingRight: 36 }} required />
              <PwdToggle show={showNewPwd} onToggle={() => setShowNewPwd(v => !v)}
                label={showNewPwd ? 'Hide password' : 'Show password'} />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="recover-confirmpwd">Confirm new password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-control" id="recover-confirmpwd"
                type={showConfirmPwd ? 'text' : 'password'} placeholder="Repeat new password"
                value={passwords.confirm_password}
                onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                style={{ paddingRight: 36 }} required />
              <PwdToggle show={showConfirmPwd} onToggle={() => setShowConfirmPwd(v => !v)}
                label={showConfirmPwd ? 'Hide password' : 'Show password'} />
            </div>
          </div>
          <button className="btn btn-primary w-100 btn-user mb-3" type="submit"
            disabled={loading || otp.length !== 6} aria-busy={loading}>
            {loading
              ? <><i className="fas fa-spinner fa-spin me-2" aria-hidden="true" />Resetting…</>
              : 'Reset Password'
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

      {/* ── Step 3: Success ── */}
      {step === 3 && (
        <div className="text-center py-2">
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <i className="fas fa-check-circle" style={{ fontSize: '1.75rem', color: '#16a34a' }} aria-hidden="true" />
          </div>
          <p className="text-success mb-4">{info}</p>
          <Link className="btn btn-primary btn-user w-100" to="/login">
            Back to Login
          </Link>
        </div>
      )}

      {step !== 3 && (
        <div className="auth-links">
          <span style={{ color: '#6b7280' }}>Remembered your password?</span>
          <Link to="/login">Sign in</Link>
        </div>
      )}
    </div>
  )
}
