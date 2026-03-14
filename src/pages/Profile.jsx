import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { updateUser } = useAuth()
  const [userForm, setUserForm] = useState({ username: '', email: '', name: '' })
  const [contactForm, setContactForm] = useState({ address: '', city: '', country: '', phone: '' })
  const [userRole, setUserRole]     = useState(null)
  const [avatarUrl, setAvatarUrl]   = useState('/assets/img/dogs/image2.jpeg')
  const [userMsg, setUserMsg]       = useState('')
  const [contactMsg, setContactMsg] = useState('')
  const [pwdForm, setPwdForm]       = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [pwdMsg, setPwdMsg]         = useState({ text: '', type: '' })
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd]         = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  useEffect(() => {
    api.getMe().then((u) => {
      setUserForm({ username: u.username || '', email: u.email || '', name: u.name || '' })
      setContactForm({ address: u.address || '', city: u.city || '', country: u.country || '', phone: u.phone || '' })
      setUserRole(u.role || null)
      if (u.avatar_url) setAvatarUrl(u.avatar_url)
    }).catch(console.error)
  }, [])

  const handleUserChange    = (e) => setUserForm({ ...userForm, [e.target.name]: e.target.value })
  const handleContactChange = (e) => setContactForm({ ...contactForm, [e.target.name]: e.target.value })

  const handleUserSubmit = async (e) => {
    e.preventDefault()
    try {
      const updated = await api.updateMe(userForm)
      updateUser(updated)
      setUserMsg('Settings saved.')
      setTimeout(() => setUserMsg(''), 3000)
    } catch (err) {
      setUserMsg(err.message)
    }
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.updateContact(contactForm)
      setContactMsg('Contact saved.')
      setTimeout(() => setContactMsg(''), 3000)
    } catch (err) {
      setContactMsg(err.message)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPwdMsg({ text: '', type: '' })
    try {
      const data = await api.changePassword(pwdForm)
      setPwdForm({ current_password: '', new_password: '', confirm_password: '' })
      setPwdMsg({ text: data.message, type: 'success' })
      setTimeout(() => setPwdMsg({ text: '', type: '' }), 4000)
    } catch (err) {
      setPwdMsg({ text: err.message, type: 'danger' })
    }
  }

  return (
    <>
      <h3 className="text-dark mb-4">Profile</h3>
      <div className="row mb-3">
        <div className="col-lg-4">
          <div className="card mb-3">
            <div className="card-body text-center shadow">
              <img
                className="rounded-circle mt-4 mb-3"
                src={avatarUrl}
                width="160"
                height="160"
                alt="profile"
              />
              <div className="mb-3">
                <button className="btn btn-primary btn-sm" type="button">
                  Change Photo
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="row">
            <div className="col">
              <div className="card shadow mb-3">
                <div className="card-header py-3">
                  <p className="text-primary m-0 fw-bold">User Settings</p>
                </div>
                <div className="card-body">
                  {userMsg && <div className="alert alert-info py-1 small">{userMsg}</div>}
                  <form onSubmit={handleUserSubmit}>
                    <div className="row">
                      <div className="col">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="username"><strong>Username</strong></label>
                          <input
                            className="form-control"
                            type="text"
                            id="username"
                            placeholder="user.name"
                            name="username"
                            value={userForm.username}
                            onChange={handleUserChange}
                          />
                        </div>
                      </div>
                      <div className="col">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="email"><strong>Email Address</strong></label>
                          <input
                            className="form-control"
                            type="email"
                            id="email"
                            placeholder="user@example.com"
                            name="email"
                            value={userForm.email}
                            onChange={handleUserChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="name"><strong>Name</strong></label>
                          <input
                            className="form-control"
                            type="text"
                            id="name"
                            placeholder="John"
                            name="name"
                            value={userForm.name}
                            onChange={handleUserChange}
                          />
                        </div>
                      </div>
                      <div className="col">
                        <div className="mb-3">
                          <label className="form-label"><strong>Role</strong></label>
                          <div>
                            {userRole ? (
                              <span className="badge fs-6 fw-semibold text-capitalize"
                                style={{
                                  background: userRole === 'admin' ? '#fee2e2' : userRole === 'manager' ? '#fef9c3' : '#dcfce7',
                                  color:      userRole === 'admin' ? '#dc2626' : userRole === 'manager' ? '#b45309' : '#16a34a',
                                  borderRadius: 8, padding: '5px 14px',
                                }}>
                                {userRole}
                              </span>
                            ) : (
                              <span className="badge fs-6 fw-semibold" style={{ background: '#f3f4f6', color: '#9ca3af', borderRadius: 8, padding: '5px 14px' }}>
                                No Role Assigned
                              </span>
                            )}
                            <div className="form-text mt-1">Roles are assigned by your manager or admin.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <button className="btn btn-primary btn-sm" type="submit">Save Settings</button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="card shadow">
                <div className="card-header py-3">
                  <p className="text-primary m-0 fw-bold">Contact Settings</p>
                </div>
                <div className="card-body">
                  {contactMsg && <div className="alert alert-info py-1 small">{contactMsg}</div>}
                  <form onSubmit={handleContactSubmit}>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="address"><strong>Address</strong></label>
                      <input
                        className="form-control"
                        type="text"
                        id="address"
                        placeholder="Sunset Blvd, 38"
                        name="address"
                        value={contactForm.address}
                        onChange={handleContactChange}
                      />
                    </div>
                    <div className="row">
                      <div className="col">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="city"><strong>City</strong></label>
                          <input
                            className="form-control"
                            type="text"
                            id="city"
                            placeholder="Los Angeles"
                            name="city"
                            value={contactForm.city}
                            onChange={handleContactChange}
                          />
                        </div>
                      </div>
                      <div className="col">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="country"><strong>Country</strong></label>
                          <input
                            className="form-control"
                            type="text"
                            id="country"
                            placeholder="USA"
                            name="country"
                            value={contactForm.country}
                            onChange={handleContactChange}
                          />
                        </div>
                      </div>
                      <div className="col">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="phone"><strong>Phone Number</strong></label>
                          <input
                            className="form-control"
                            type="tel"
                            id="phone"
                            placeholder="+1 555 000 0000"
                            name="phone"
                            value={contactForm.phone}
                            onChange={handleContactChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <button className="btn btn-primary btn-sm" type="submit">Save Settings</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
              <div className="card shadow mb-3">
                <div className="card-header py-3">
                  <p className="text-primary m-0 fw-bold">Change Password</p>
                </div>
                <div className="card-body">
                  {pwdMsg.text && <div className={`alert alert-${pwdMsg.type} py-1 small`}>{pwdMsg.text}</div>}
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-3">
                      <label className="form-label"><strong>Current Password</strong></label>
                      <div style={{ position: 'relative' }}>
                        <input
                          className="form-control"
                          type={showCurrentPwd ? 'text' : 'password'}
                          placeholder="Enter current password"
                          value={pwdForm.current_password}
                          onChange={(e) => setPwdForm({ ...pwdForm, current_password: e.target.value })}
                          style={{ paddingRight: 36 }}
                          required
                        />
                        <button type="button" onClick={() => setShowCurrentPwd((v) => !v)} tabIndex={-1}
                          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>
                          <i className={showCurrentPwd ? 'fas fa-eye-slash' : 'fas fa-eye'} style={{ fontSize: 14 }} />
                        </button>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <div className="mb-3">
                          <label className="form-label"><strong>New Password</strong></label>
                          <div style={{ position: 'relative' }}>
                            <input
                              className="form-control"
                              type={showNewPwd ? 'text' : 'password'}
                              placeholder="At least 6 characters"
                              value={pwdForm.new_password}
                              onChange={(e) => setPwdForm({ ...pwdForm, new_password: e.target.value })}
                              style={{ paddingRight: 36 }}
                              required
                            />
                            <button type="button" onClick={() => setShowNewPwd((v) => !v)} tabIndex={-1}
                              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>
                              <i className={showNewPwd ? 'fas fa-eye-slash' : 'fas fa-eye'} style={{ fontSize: 14 }} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col">
                        <div className="mb-3">
                          <label className="form-label"><strong>Confirm New Password</strong></label>
                          <div style={{ position: 'relative' }}>
                            <input
                              className="form-control"
                              type={showConfirmPwd ? 'text' : 'password'}
                              placeholder="Repeat new password"
                              value={pwdForm.confirm_password}
                              onChange={(e) => setPwdForm({ ...pwdForm, confirm_password: e.target.value })}
                              style={{ paddingRight: 36 }}
                              required
                            />
                            <button type="button" onClick={() => setShowConfirmPwd((v) => !v)} tabIndex={-1}
                              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>
                              <i className={showConfirmPwd ? 'fas fa-eye-slash' : 'fas fa-eye'} style={{ fontSize: 14 }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <button className="btn btn-primary btn-sm" type="submit">Change Password</button>
                    </div>
                  </form>
                </div>
              </div>
    </>
  )
}
