import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm]   = useState({ email: '', password: '' })
  const [error, setError] = useState('')
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
    <div
      className="container"
      style={{ scale: '1.1', paddingTop: '0.5rem', paddingLeft: 0, paddingRight: 0 }}
    >
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-12 col-xl-10">
          <div className="card shadow-lg my-5 o-hidden border-0">
            <div className="card-body p-0">
              <div className="row">
                <div className="col-lg-6 d-none d-lg-flex">
                  <div
                    className="flex-grow-1 bg-login-image"
                    style={{
                      backgroundImage:
                        'url("https://t4.ftcdn.net/jpg/01/81/65/85/360_F_181658575_6gz3Gx96iRndmBtXv2llVsGOGsfdT1AP.jpg")',
                    }}
                  ></div>
                </div>
                <div className="col-lg-6">
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
                      <h4 className="text-dark mb-4">Welcome Back!</h4>
                    </div>
                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    <form className="user" onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <input
                          className="form-control form-control-user"
                          type="email"
                          id="exampleInputEmail"
                          aria-describedby="user_id"
                          placeholder="Email Address"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <div style={{ position: 'relative' }}>
                          <input
                            className="form-control form-control-user"
                            type={showPwd ? 'text' : 'password'}
                            id="exampleInputPassword"
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
                      <div className="mb-3">
                        <div className="custom-checkbox small">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="formCheck-1"
                            />
                            <label className="form-check-label" htmlFor="formCheck-1">
                              Remember Me
                            </label>
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-primary d-block w-100 btn-user"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Logging in…' : 'Login'}
                      </button>
                      <hr />
                    </form>
                    <div className="text-center">
                      <Link className="small" to="/recover-password">
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="text-center">
                      <Link className="small" to="/register">
                        Create an Account!
                      </Link>
                    </div>
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
