import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Pending() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fc',
        padding: '2rem',
      }}
    >
      {/* Logo mark */}
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ marginBottom: 12 }}>
        <rect x="2" y="15" width="20" height="5" rx="2" fill="#575D90" />
        <rect x="5" y="9.5" width="14" height="5" rx="2" fill="#575D90" fillOpacity="0.72" />
        <rect x="8" y="4" width="8" height="5" rx="2" fill="#575D90" fillOpacity="0.44" />
      </svg>
      <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#575D90', letterSpacing: '-0.01em', marginBottom: 32 }}>
        CoreInventory
      </div>

      <div
        className="card shadow"
        style={{ maxWidth: 460, width: '100%', borderRadius: 14, overflow: 'hidden' }}
      >
        <div style={{ background: '#575D90', padding: '28px 32px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <i className="fas fa-user-clock" style={{ color: '#fff', fontSize: 20 }} />
            </span>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>
                Account Pending
              </div>
              <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.83rem', marginTop: 2 }}>
                Welcome, {user?.name || user?.username}
              </div>
            </div>
          </div>
        </div>

        <div className="card-body" style={{ padding: '28px 32px' }}>
          <p style={{ color: '#374151', lineHeight: 1.65, marginBottom: 20 }}>
            Your account has been created successfully, but you have not been assigned a
            role yet. Please contact your manager or an administrator to get access.
          </p>

          <div
            style={{
              background: '#f0f4ff',
              border: '1px solid #c7d2fe',
              borderRadius: 10,
              padding: '14px 16px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              marginBottom: 24,
            }}
          >
            <i className="fas fa-info-circle" style={{ color: '#575D90', marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: '0.84rem', color: '#374151', lineHeight: 1.55 }}>
              Once a role is assigned to your account, log out and log back in to gain access.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/profile')}
            >
              <i className="fas fa-user me-2" />
              View Profile
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt me-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
