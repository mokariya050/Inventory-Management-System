import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

export default function RecoverPassword() {
  const [step, setStep]       = useState(1) // 1=email, 2=otp+new-password, 3=success
  const [email, setEmail]     = useState('')
  const [otp, setOtp]         = useState('')
  const [passwords, setPasswords] = useState({ new_password: '', confirm_password: '' })
  const [info, setInfo]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  // Step 1 — send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      const data = await api.sendOtp({ email, purpose: 'reset' })
      setInfo(data.message)
      setStep(2)
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
      const data = await api.sendOtp({ email, purpose: 'reset' })
      setInfo(data.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2 — verify OTP and set new password
  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
    if (passwords.new_password !== passwords.confirm_password) {
      setError('Passwords do not match')
      return
    }
    if (passwords.new_password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
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

  const renderForm = () => {
    if (step === 1) return (
      <form className="user" onSubmit={handleSendOtp}>
        <div className="mb-3">
          <input
            className="form-control form-control-user"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary d-block w-100 btn-user" type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send OTP'}
        </button>
        <hr />
      </form>
    )

    if (step === 2) return (
      <form className="user" onSubmit={handleReset}>
        <p className="text-center text-muted small mb-3">
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>
        <div className="mb-3">
          <input
            className="form-control form-control-user text-center"
            style={{ letterSpacing: '0.6em', fontSize: '1.4rem' }}
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
          <input
            className="form-control form-control-user"
            type="password"
            placeholder="New Password"
            value={passwords.new_password}
            onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control form-control-user"
            type="password"
            placeholder="Confirm New Password"
            value={passwords.confirm_password}
            onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
            required
          />
        </div>
        <button
          className="btn btn-primary d-block w-100 btn-user"
          type="submit"
          disabled={loading || otp.length !== 6}
        >
          {loading ? 'Resetting…' : 'Reset Password'}
        </button>
        <div className="text-center mt-3 small">
          <button type="button" className="btn btn-link p-0 small" onClick={handleResend} disabled={loading}>
            Resend OTP
          </button>
          {' · '}
          <button
            type="button"
            className="btn btn-link p-0 small"
            onClick={() => { setStep(1); setOtp(''); setError(''); setInfo('') }}
          >
            Back
          </button>
        </div>
        <hr />
      </form>
    )

    if (step === 3) return (
      <div className="text-center py-2">
        <i className="fas fa-check-circle fa-3x text-success mb-3 d-block"></i>
        <p className="text-success mb-4">{info}</p>
        <Link className="btn btn-primary btn-user w-100" to="/login">Go to Login</Link>
        <hr />
      </div>
    )
  }

  return (
    <div className="container" style={{ scale: '1.1', paddingTop: '0.5rem', paddingLeft: 0, paddingRight: 0 }}>
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-12 col-xl-10">
          <div className="card shadow-lg my-5 o-hidden border-0">
            <div className="card-body p-0">
              <div className="row">
                <div className="col-lg-6 d-none d-lg-flex">
                  <div
                    className="flex-grow-1 bg-login-image"
                    style={{ backgroundImage: 'url("https://t4.ftcdn.net/jpg/01/81/65/85/360_F_181658575_6gz3Gx96iRndmBtXv2llVsGOGsfdT1AP.jpg")' }}
                  ></div>
                </div>
                <div className="col-lg-6">
                  <div className="p-5">
                    <div className="text-center">
                      <h4 className="text-dark mb-4">Reset Password</h4>
                    </div>
                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    {info && step !== 3 && <div className="alert alert-info py-2">{info}</div>}
                    {renderForm()}
                    {step !== 3 && (
                      <div className="text-center">
                        <Link className="small" to="/login">Back to Login</Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
