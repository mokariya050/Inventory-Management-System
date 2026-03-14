import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSidebar } from '../context/SidebarContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export default function Topbar() {
  const { toggleSidebar }   = useSidebar()
  const { user, logout }    = useAuth()
  const navigate             = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [messages, setMessages]           = useState([])

  useEffect(() => {
    api.getNotifications().then(setNotifications).catch(console.error)
    api.getInbox().then(setMessages).catch(console.error)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const unreadNotifications = notifications.filter((n) => !n.isRead).length
  const unreadMessages      = messages.filter((m) => !m.isRead).length

  const statusClass = (status) => {
    if (status === 'online') return 'bg-success'
    if (status === 'away')   return 'bg-warning'
    return ''
  }

  return (
    <nav className="navbar navbar-expand bg-white shadow mb-4 topbar">
      <div className="container-fluid">
        <button
          className="btn btn-link d-md-none me-3 rounded-circle"
          id="sidebarToggleTop"
          onClick={toggleSidebar}
          type="button"
        >
          <i className="fas fa-bars"></i>
        </button>
        <ul className="navbar-nav flex-nowrap ms-auto">
          {/* Mobile search */}
          <li className="nav-item dropdown d-sm-none no-arrow">
            <a className="dropdown-toggle nav-link" data-bs-toggle="dropdown" aria-expanded="false" href="#">
              <i className="fas fa-search"></i>
            </a>
            <div className="dropdown-menu p-3 dropdown-menu-end animated--grow-in" aria-labelledby="searchDropdown">
              <form className="w-100 me-auto navbar-search">
                <div className="input-group">
                  <input className="bg-light border-0 form-control small" type="text" placeholder="Search for ..." />
                  <button className="btn btn-primary" type="button">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </form>
            </div>
          </li>

          {/* Notifications */}
          <li className="nav-item mx-1 dropdown no-arrow">
            <div className="nav-item dropdown no-arrow">
              <a className="dropdown-toggle nav-link" data-bs-toggle="dropdown" aria-expanded="false" href="#">
                {unreadNotifications > 0 && (
                  <span className="badge bg-danger badge-counter">{unreadNotifications}</span>
                )}
                <i className="fas fa-bell fa-fw"></i>
              </a>
              <div className="dropdown-menu dropdown-menu-end dropdown-list animated--grow-in">
                <h6 className="dropdown-header">alerts center</h6>
                {notifications.map((n) => (
                  <a key={n.id} className="dropdown-item d-flex align-items-center" href="#">
                    <div className="me-3">
                      <div className={`${n.iconBg} icon-circle`}>
                        <i className={`${n.icon} text-white`}></i>
                      </div>
                    </div>
                    <div>
                      <span className="small text-gray-500">{n.date}</span>
                      <p>{n.message}</p>
                    </div>
                  </a>
                ))}
                <a className="dropdown-item text-center small text-gray-500" href="#">Show All Alerts</a>
              </div>
            </div>
          </li>

          {/* Messages */}
          <li className="nav-item mx-1 dropdown no-arrow">
            <div className="nav-item dropdown no-arrow">
              <a className="dropdown-toggle nav-link" data-bs-toggle="dropdown" aria-expanded="false" href="#">
                {unreadMessages > 0 && (
                  <span className="badge bg-danger badge-counter">{unreadMessages}</span>
                )}
                <i className="fas fa-envelope fa-fw"></i>
              </a>
              <div className="dropdown-menu dropdown-menu-end dropdown-list animated--grow-in">
                <h6 className="dropdown-header">messages center</h6>
                {messages.map((m) => (
                  <a key={m.id} className="dropdown-item d-flex align-items-center" href="#">
                    <div className="me-3 dropdown-list-image">
                      <img className="rounded-circle" src={m.senderAvatar} alt="" />
                      <div className={`${statusClass(m.onlineStatus)} status-indicator`}></div>
                    </div>
                    <div className="fw-bold">
                      <div className="text-truncate"><span>{m.preview}</span></div>
                      <p className="mb-0 small text-gray-500">{m.senderName} - {m.sentAt}</p>
                    </div>
                  </a>
                ))}
                <a className="dropdown-item text-center small text-gray-500" href="#">Show All Messages</a>
              </div>
            </div>
          </li>

          <div className="d-none d-sm-block topbar-divider"></div>

          {/* User menu */}
          <li className="nav-item dropdown no-arrow">
            <div className="nav-item dropdown no-arrow">
              <a className="dropdown-toggle nav-link" data-bs-toggle="dropdown" aria-expanded="false" href="#">
                <span className="d-none d-lg-inline me-2 text-gray-600 small">
                  {user?.name || user?.username || 'User'}
                </span>
                <img
                  className="border rounded-circle img-profile"
                  src={user?.avatar_url || '/assets/img/avatars/avatar1.jpeg'}
                  alt="user avatar"
                />
              </a>
              <div className="dropdown-menu shadow dropdown-menu-end animated--grow-in">
                <a className="dropdown-item" href="/profile">
                  <i className="fas fa-user me-2 fa-sm fa-fw text-gray-400"></i>&nbsp;Profile
                </a>
                <a className="dropdown-item" href="#">
                  <i className="fas fa-cogs me-2 fa-sm fa-fw text-gray-400"></i>&nbsp;Settings
                </a>
                <a className="dropdown-item" href="#">
                  <i className="fas fa-list me-2 fa-sm fa-fw text-gray-400"></i>&nbsp;Activity log
                </a>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleLogout} type="button">
                  <i className="fas fa-sign-out-alt me-2 fa-sm fa-fw text-gray-400"></i>&nbsp;Logout
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  )
}
