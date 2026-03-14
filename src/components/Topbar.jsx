import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSidebar } from '../context/SidebarContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

// ── Page title map ──────────────────────────────────────────────────────────
const PAGE_TITLES = {
  '/': { title: 'Dashboard', icon: 'fas fa-tachometer-alt' },
  '/products': { title: 'Products', icon: 'fas fa-box' },
  '/operations/receipts': { title: 'Receipts', icon: 'fas fa-truck-loading' },
  '/operations/deliveries': { title: 'Deliveries', icon: 'fas fa-truck' },
  '/operations/transfers': { title: 'Transfers', icon: 'fas fa-exchange-alt' },
  '/operations/adjustments': { title: 'Adjustments', icon: 'fas fa-sliders-h' },
  '/move-history': { title: 'Move History', icon: 'fas fa-history' },
  '/settings/warehouses': { title: 'Warehouses', icon: 'fas fa-warehouse' },
  '/admin/users': { title: 'User Management', icon: 'fas fa-users-cog' },
  '/profile': { title: 'My Profile', icon: 'fas fa-user' },
  '/pending': { title: 'Account Pending', icon: 'fas fa-user-clock' },
}

function getPageMeta(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  // Match nested paths (e.g. /operations/receipts/123)
  const match = Object.entries(PAGE_TITLES).find(([key]) =>
    key !== '/' && pathname.startsWith(key)
  )
  return match ? match[1] : { title: 'CoreInventory', icon: 'fas fa-boxes' }
}

// ── Avatar with initials fallback ────────────────────────────────────────────
function Avatar({ user, size = 36 }) {
  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.name || user.username || 'User'}
        style={{ width: size, height: size, objectFit: 'cover', borderRadius: '50%', flexShrink: 0 }}
      />
    )
  }
  const name = user?.name || user?.username || 'U'
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span
      aria-hidden="true"
      style={{
        width: size, height: size, borderRadius: '50%',
        background: '#575D90', color: '#fff', flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.round(size * 0.36), fontWeight: 700, userSelect: 'none',
      }}
    >
      {initials}
    </span>
  )
}

// ── Relative time helper ──────────────────────────────────────────────────────
function relativeTime(dateStr) {
  if (!dateStr) return ''
  const s = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

// ── Click-outside hook ────────────────────────────────────────────────────────
function useClickOutside(ref, close) {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) close()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [ref, close])
}

// ── Icon button ───────────────────────────────────────────────────────────────
const iconBtnStyle = {
  position: 'relative', background: 'none', border: 'none',
  cursor: 'pointer', color: '#6b7280', fontSize: 17,
  padding: '6px 10px', borderRadius: 6, lineHeight: 1,
  transition: 'background 0.15s, color 0.15s',
}

// ── Unread dot ────────────────────────────────────────────────────────────────
function UnreadDot() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute', top: 5, right: 7,
        width: 8, height: 8, borderRadius: '50%',
        background: '#ef4444', border: '2px solid #fff',
      }}
    />
  )
}

// ── Dropdown panel ────────────────────────────────────────────────────────────
function Dropdown({ label, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useClickOutside(ref, close)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {children[0]({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          role="menu"
          aria-label={label}
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            minWidth: 300, background: '#fff', borderRadius: 10,
            boxShadow: '0 10px 30px rgba(0,0,0,0.13)', border: '1px solid #e5e7eb',
            zIndex: 1050, overflow: 'hidden',
          }}
        >
          {children[1]({ close })}
        </div>
      )}
    </div>
  )
}

// ── Panel header ──────────────────────────────────────────────────────────────
function PanelHeader({ title, badge }) {
  return (
    <div style={{
      padding: '12px 16px', borderBottom: '1px solid #f0f0f0',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#111827' }}>{title}</span>
      {badge > 0 && (
        <span style={{ fontSize: '0.72rem', color: '#6b7280', background: '#f3f4f6', padding: '2px 7px', borderRadius: 12 }}>
          {badge} unread
        </span>
      )}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyPanel({ text }) {
  return (
    <div style={{ padding: '28px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '0.83rem' }}>
      {text}
    </div>
  )
}

// ── Menu row button helper ────────────────────────────────────────────────────
const menuRowBase = {
  display: 'flex', alignItems: 'flex-start', gap: 10,
  width: '100%', padding: '10px 16px', background: 'none',
  border: 'none', borderBottom: '1px solid #fafafa',
  cursor: 'pointer', textAlign: 'left',
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Topbar() {
  const { toggleSidebar } = useSidebar()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifications, setNotifications] = useState([])
  const [messages, setMessages] = useState([])

  const pageMeta = getPageMeta(location.pathname)

  useEffect(() => {
    api.getNotifications().then(setNotifications).catch(console.error)
    api.getInbox().then(setMessages).catch(console.error)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const unreadNotifs = notifications.filter((n) => !n.isRead).length
  const unreadMsgs = messages.filter((m) => !m.isRead).length

  const statusColor = (s) =>
    s === 'online' ? '#22c55e' : s === 'away' ? '#f59e0b' : '#d1d5db'

  return (
    <header
      role="banner"
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: 60, background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center',
        padding: '0 1.25rem', gap: '0.75rem',
      }}
    >
      {/* Sidebar toggle */}
      <button
        type="button"
        aria-label="Toggle sidebar"
        onClick={toggleSidebar}
        style={iconBtnStyle}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280' }}
      >
        <i className="fas fa-bars" aria-hidden="true"></i>
      </button>

      {/* Page breadcrumb */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
        <i className={`${pageMeta.icon} text-primary`} aria-hidden="true" style={{ fontSize: 14, flexShrink: 0 }}></i>
        <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {pageMeta.title}
        </span>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>

        {/* ── Notifications ── */}
        <Dropdown label="Notifications">
          {[
            ({ open, toggle }) => (
              <button
                key="trigger"
                type="button"
                aria-label={`Notifications${unreadNotifs > 0 ? `, ${unreadNotifs} unread` : ''}`}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={toggle}
                style={iconBtnStyle}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280' }}
              >
                <i className="fas fa-bell" aria-hidden="true"></i>
                {unreadNotifs > 0 && <UnreadDot />}
              </button>
            ),
            ({ close }) => (
              <div key="panel">
                <PanelHeader title="Notifications" badge={unreadNotifs} />
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {notifications.length === 0
                    ? <EmptyPanel text="No notifications" />
                    : notifications.map((n) => (
                      <button
                        key={n.id}
                        role="menuitem"
                        type="button"
                        onClick={close}
                        style={menuRowBase}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <span style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <i className={`${n.icon || 'fas fa-info'} text-white`} style={{ fontSize: 12 }} aria-hidden="true"></i>
                        </span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.81rem', color: '#374151', lineHeight: 1.45 }}>{n.message}</div>
                          <div style={{ fontSize: '0.71rem', color: '#9ca3af', marginTop: 2 }}>{relativeTime(n.date)}</div>
                        </div>
                        {!n.isRead && (
                          <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: '#4f46e5', flexShrink: 0, marginTop: 5 }} />
                        )}
                      </button>
                    ))
                  }
                </div>
              </div>
            ),
          ]}
        </Dropdown>

        {/* ── Messages ── */}
        <Dropdown label="Messages">
          {[
            ({ open, toggle }) => (
              <button
                key="trigger"
                type="button"
                aria-label={`Messages${unreadMsgs > 0 ? `, ${unreadMsgs} unread` : ''}`}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={toggle}
                style={iconBtnStyle}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280' }}
              >
                <i className="fas fa-envelope" aria-hidden="true"></i>
                {unreadMsgs > 0 && <UnreadDot />}
              </button>
            ),
            ({ close }) => (
              <div key="panel">
                <PanelHeader title="Messages" badge={unreadMsgs} />
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {messages.length === 0
                    ? <EmptyPanel text="No messages" />
                    : messages.map((m) => (
                      <button
                        key={m.id}
                        role="menuitem"
                        type="button"
                        onClick={close}
                        style={menuRowBase}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          {m.senderAvatar
                            ? <img src={m.senderAvatar} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                            : (
                              <span style={{
                                width: 34, height: 34, borderRadius: '50%', background: '#575D90', color: '#fff',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13, fontWeight: 700,
                              }}>
                                {(m.senderName || 'U')[0].toUpperCase()}
                              </span>
                            )
                          }
                          <span aria-hidden="true" style={{
                            position: 'absolute', bottom: 1, right: 1,
                            width: 9, height: 9, borderRadius: '50%',
                            background: statusColor(m.onlineStatus), border: '2px solid #fff',
                          }} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.81rem', color: '#111827' }}>{m.senderName}</span>
                            <span style={{ fontSize: '0.7rem', color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>{relativeTime(m.sentAt)}</span>
                          </div>
                          <div style={{ fontSize: '0.79rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 190 }}>
                            {m.preview}
                          </div>
                        </div>
                        {!m.isRead && (
                          <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: '#4f46e5', flexShrink: 0, marginTop: 7 }} />
                        )}
                      </button>
                    ))
                  }
                </div>
              </div>
            ),
          ]}
        </Dropdown>

        {/* Divider */}
        <div aria-hidden="true" style={{ width: 1, height: 22, background: '#e5e7eb', margin: '0 6px' }} />

        {/* ── User menu ── */}
        <Dropdown label="User menu">
          {[
            ({ open, toggle }) => (
              <button
                key="trigger"
                type="button"
                aria-label="User menu"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={toggle}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px 8px', borderRadius: 8, transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <Avatar user={user} size={32} />
                <div className="d-none d-lg-block" style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.81rem', fontWeight: 600, color: '#111827', lineHeight: 1.25 }}>
                    {user?.name || user?.username || 'User'}
                  </div>
                  {user?.role && (
                    <div style={{ fontSize: '0.69rem', color: '#6b7280', lineHeight: 1.25 }}>
                      {user.role}
                    </div>
                  )}
                </div>
                <i className="fas fa-chevron-down d-none d-lg-inline" aria-hidden="true" style={{ fontSize: 9, color: '#9ca3af', marginLeft: 2 }}></i>
              </button>
            ),
            ({ close }) => (
              <div key="panel">
                {/* User header */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar user={user} size={40} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.87rem', color: '#111827' }}>
                      {user?.name || user?.username}
                    </div>
                    {user?.role && <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{user.role}</div>}
                  </div>
                </div>
                {/* Nav links */}
                <div role="none">
                  {[
                    { to: '/profile', icon: 'fas fa-user', label: 'My Profile', minLevel: 0 },
                    { to: '/settings/warehouses', icon: 'fas fa-warehouse', label: 'Warehouses', minLevel: 2 },
                    { to: '/admin/users', icon: 'fas fa-users-cog', label: 'User Management', minLevel: 3 },
                  ].filter(item => ({ admin: 3, manager: 2, staff: 1 })[user?.role] >= item.minLevel || (item.minLevel === 0)).map(({ to, icon, label }) => (
                    <Link
                      key={to}
                      role="menuitem"
                      to={to}
                      onClick={close}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 16px', color: '#374151', textDecoration: 'none',
                        fontSize: '0.84rem', borderBottom: '1px solid #fafafa',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <i className={`${icon} fa-fw`} aria-hidden="true" style={{ color: '#9ca3af', width: 16 }}></i>
                      {label}
                    </Link>
                  ))}
                </div>
                {/* Sign out */}
                <div style={{ borderTop: '1px solid #f0f0f0' }}>
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => { close(); handleLogout() }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '10px 16px', background: 'none',
                      border: 'none', cursor: 'pointer', color: '#ef4444',
                      fontSize: '0.84rem', textAlign: 'left', transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <i className="fas fa-sign-out-alt fa-fw" aria-hidden="true" style={{ width: 16 }}></i>
                    Sign out
                  </button>
                </div>
              </div>
            ),
          ]}
        </Dropdown>

      </div>
    </header>
  )
}
