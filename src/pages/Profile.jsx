import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { updateUser } = useAuth()
  const [projects, setProjects] = useState([])
  const [userForm, setUserForm] = useState({ username: '', email: '', name: '', role: '' })
  const [contactForm, setContactForm] = useState({ address: '', city: '', country: '' })
  const [avatarUrl, setAvatarUrl] = useState('/assets/img/dogs/image2.jpeg')
  const [userMsg, setUserMsg]       = useState('')
  const [contactMsg, setContactMsg] = useState('')

  useEffect(() => {
    api.getMe().then((u) => {
      setUserForm({ username: u.username || '', email: u.email || '', name: u.name || '', role: u.role || '' })
      setContactForm({ address: u.address || '', city: u.city || '', country: u.country || '' })
      if (u.avatar_url) setAvatarUrl(u.avatar_url)
    }).catch(console.error)
    api.getProjects().then(setProjects).catch(console.error)
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
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="text-primary m-0 fw-bold">Projects</h6>
            </div>
            <div className="card-body">
              {projects.map((p) => (
                <div key={p.id}>
                  <h4 className="small fw-bold">
                    {p.name}
                    <span className="float-end">{p.progress === 100 ? 'Complete!' : `${p.progress}%`}</span>
                  </h4>
                  <div className="progress mb-3 progress-sm">
                    <div
                      className={`progress-bar ${p.color}`}
                      aria-valuenow={p.progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      style={{ width: `${p.progress}%` }}
                    >
                      <span className="visually-hidden">{p.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="row mb-3 d-none">
            <div className="col">
              <div className="card text-white bg-primary shadow">
                <div className="card-body">
                  <div className="row mb-2">
                    <div className="col">
                      <p className="m-0">Performance</p>
                      <p className="m-0"><strong>65.2%</strong></p>
                    </div>
                    <div className="col-auto"><i className="fas fa-rocket fa-2x"></i></div>
                  </div>
                  <p className="text-white-50 m-0 small">
                    <i className="fas fa-arrow-up"></i>&nbsp;5% since last month
                  </p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card text-white bg-success shadow">
                <div className="card-body">
                  <div className="row mb-2">
                    <div className="col">
                      <p className="m-0">Performance</p>
                      <p className="m-0"><strong>65.2%</strong></p>
                    </div>
                    <div className="col-auto"><i className="fas fa-rocket fa-2x"></i></div>
                  </div>
                  <p className="text-white-50 m-0 small">
                    <i className="fas fa-arrow-up"></i>&nbsp;5% since last month
                  </p>
                </div>
              </div>
            </div>
          </div>
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
                          <label className="form-label" htmlFor="role"><strong>Role</strong></label>
                          <input
                            className="form-control"
                            type="text"
                            id="role"
                            placeholder="Administrator"
                            name="role"
                            value={userForm.role}
                            onChange={handleUserChange}
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
      <div className="card shadow mb-5"></div>
    </>
  )
}
