import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState(1) // 1 = details form, 2 = otp entry
  const [form, setForm] = useState({ name: '', user_id: '', email: '', password: '', password_repeat: '' })
  const [otp, setOtp]   = useState('')
  const [error, setError]   = useState('')
  const [info, setInfo]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd]           = useState(false)
  const [showPwdRepeat, setShowPwdRepeat] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [resendTimer])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Step 1 — validate locally then send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.user_id || !form.email || !form.password || !form.password_repeat) {
      setError('All fields are required')
      return
    }
    if (form.password !== form.password_repeat) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
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

  // Step 2 — verify OTP and complete registration
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
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

  return (
    <div className="container" style={{ paddingTop: '0.5rem', paddingLeft: 0, paddingRight: 0, scale: '1.1' }}>
      <div className="card shadow-lg my-5 o-hidden border-0">
        <div className="card-body p-0">
          <div className="row">
            <div className="col-lg-5 d-none d-lg-flex">
              <div
                className="flex-grow-1 bg-register-image"
                style={{ backgroundImage: 'url("https://t4.ftcdn.net/jpg/01/81/65/85/360_F_181658575_6gz3Gx96iRndmBtXv2llVsGOGsfdT1AP.jpg")' }}
              ></div>
            </div>
            <div className="col-lg-7">
              <div className="p-5">
                <div className="text-center mb-4">
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="2" y="15" width="20" height="5" rx="2" fill="#575D90"/>
                    <rect x="5" y="9.5" width="14" height="5" rx="2" fill="#575D90" fillOpacity="0.72"/>
                    <rect x="8" y="4" width="8" height="5" rx="2" fill="#575D90" fillOpacity="0.44"/>
                  </svg>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#575D90', letterSpacing: '-0.01em', marginTop: 6 }}>
                    CoreInventory
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-dark mb-4">Create an Account!</h4>
                </div>

                {error && <div className="alert alert-danger py-2">{error}</div>}
                {info  && <div className="alert alert-info py-2">{info}</div>}

                {/* ── Step 1: registration details ── */}
                {step === 1 && (
                  <form className="user" onSubmit={handleSendOtp}>
                    <div className="mb-3 row">
                      <div className="col-sm-6 mb-3 mb-sm-0">
                        <input
                          className="form-control form-control-user"
                          type="text"
                          placeholder="Name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-sm-6">
                        <input
                          className="form-control form-control-user"
                          type="text"
                          placeholder="User ID"
                          name="user_id"
                          value={form.user_id}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <input
                        className="form-control form-control-user"
                        type="email"
                        placeholder="Email Address"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3 row">
                      <div className="col-sm-6 mb-3 mb-sm-0">
                        <div style={{ position: 'relative' }}>
                          <input
                            className="form-control form-control-user"
                            type={showPwd ? 'text' : 'password'}
                            placeholder="Password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            style={{ paddingRight: 36 }}
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
                      <div className="col-sm-6">
                        <div style={{ position: 'relative' }}>
                          <input
                            className="form-control form-control-user"
                            type={showPwdRepeat ? 'text' : 'password'}
                            placeholder="Re-Enter Password"
                            name="password_repeat"
                            value={form.password_repeat}
                            onChange={handleChange}
                            style={{ paddingRight: 36 }}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPwdRepeat((v) => !v)}
                            tabIndex={-1}
                            aria-label={showPwdRepeat ? 'Hide password' : 'Show password'}
                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}
                          >
                            <i className={showPwdRepeat ? 'fas fa-eye-slash' : 'fas fa-eye'} style={{ fontSize: 14 }} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-primary d-block w-100 btn-user" type="submit" disabled={loading}>
                      {loading ? 'Sending OTP…' : 'Send OTP to Email'}
                    </button>
                    <hr />
                  </form>
                )}

                {/* ── Step 2: OTP verification ── */}
                {step === 2 && (
                  <form className="user" onSubmit={handleRegister}>
                    <p className="text-center text-muted small mb-3">
                      Enter the 6-digit code sent to <strong>{form.email}</strong>
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
                    <button
                      className="btn btn-primary d-block w-100 btn-user"
                      type="submit"
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? 'Verifying…' : 'Verify & Create Account'}
                    </button>
                    <div className="text-center mt-3 small">
                      <button type="button" className="btn btn-link p-0 small" onClick={handleResend} disabled={loading || resendTimer > 0}>
                        {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Resend OTP'}
                      </button>
                      {' · '}
                      <button
                        type="button"
                        className="btn btn-link p-0 small"
                        onClick={() => { setStep(1); setOtp(''); setError(''); setInfo(''); setResendTimer(0) }}
                      >
                        Back
                      </button>
                    </div>
                    <hr />
                  </form>
                )}

                <div className="text-center">
                  <Link className="small" to="/login">Already have an account? Login!</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
