import { useState, useEffect, useCallback } from 'react'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const ROLE_LEVELS = { admin: 3, manager: 2, staff: 1 }

const ROLE_STYLE = {
  admin: { background: '#fee2e2', color: '#dc2626' },
  manager: { background: '#fef9c3', color: '#b45309' },
  staff: { background: '#dcfce7', color: '#16a34a' },
}

function RoleBadge({ role }) {
  const style = ROLE_STYLE[role]
  if (!style) {
    return (
      <span style={{ background: '#f3f4f6', color: '#9ca3af', borderRadius: 12, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
        No Role
      </span>
    )
  }
  return (
    <span style={{ ...style, borderRadius: 12, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
      {role}
    </span>
  )
}

function RoleSelect({ targetUser, actorLevel, onAssign, disabled }) {
  const targetLevel = ROLE_LEVELS[targetUser.role] || 0
  const canModify = !disabled && targetLevel < actorLevel

  // Build options: only roles strictly below actor level, plus "No Role"
  const options = []
  if (actorLevel > (ROLE_LEVELS.manager || 0)) options.push({ value: 'manager', label: 'Manager' })
  if (actorLevel > (ROLE_LEVELS.staff || 0)) options.push({ value: 'staff', label: 'Staff' })
  options.push({ value: '', label: 'No Role' })

  if (!canModify) return <RoleBadge role={targetUser.role} />

  return (
    <select
      className="form-select form-select-sm"
      style={{ width: 120 }}
      value={targetUser.role || ''}
      onChange={(e) => onAssign(targetUser.id, e.target.value || null)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

export default function Users() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(null)   // id of user currently being saved
  const [search, setSearch] = useState('')

  const actorLevel = ROLE_LEVELS[me?.role] || 0

  const load = useCallback(() => {
    setLoading(true)
    api.getAdminUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleAssignRole = async (userId, role) => {
    setSaving(userId)
    try {
      const updated = await api.assignUserRole(userId, role)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u)))
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(null)
    }
  }

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete ${userName || 'this user'} permanently? This cannot be undone.`)) return
    try {
      await api.deleteAdminUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (e) {
      setError(e.message)
    }
  }

  const filtered = users.filter((u) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    )
  })

  return (
    <>
      <h3 className="text-dark mb-4">User Management</h3>

      {error && (
        <div className="alert alert-danger alert-dismissible py-2" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      <div className="card shadow mb-4">
        <div className="card-header py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <p className="text-primary m-0 fw-bold">All Users</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              className="form-control form-control-sm"
              style={{ width: 220 }}
              placeholder="Search name, username, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="badge bg-secondary" style={{ whiteSpace: 'nowrap' }}>
              {filtered.length} / {users.length}
            </span>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5 text-muted">
              <i className="fas fa-spinner fa-spin me-2" />Loading users…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">No users found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ paddingLeft: 20 }}>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const isMe = u.id === me?.id
                    const isSaving = saving === u.id
                    const canDelete = actorLevel >= ROLE_LEVELS.admin && !isMe

                    return (
                      <tr key={u.id} style={isMe ? { background: '#f5f3ff' } : {}}>
                        <td style={{ paddingLeft: 20 }}>
                          <span style={{ fontWeight: 600 }}>{u.name || '—'}</span>
                          {isMe && (
                            <span className="ms-2 badge bg-primary" style={{ fontSize: '0.65rem', verticalAlign: 'middle' }}>
                              You
                            </span>
                          )}
                        </td>
                        <td className="text-muted">{u.username}</td>
                        <td className="text-muted small">{u.email}</td>
                        <td>
                          {isSaving ? (
                            <span className="text-muted fst-italic small">
                              <i className="fas fa-spinner fa-spin me-1" />Saving…
                            </span>
                          ) : (
                            <RoleSelect
                              targetUser={u}
                              actorLevel={actorLevel}
                              onAssign={handleAssignRole}
                              disabled={isMe}
                            />
                          )}
                        </td>
                        <td className="text-muted small">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td>
                          {canDelete && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete user"
                              onClick={() => handleDelete(u.id, u.name || u.username)}
                            >
                              <i className="fas fa-trash-alt" />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="card shadow">
        <div className="card-header py-3">
          <p className="text-primary m-0 fw-bold">Role Permissions</p>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {[
              { role: 'admin', icon: 'fas fa-shield-alt', desc: 'Full access — manage users, assign all roles, access all inventory features and settings.' },
              { role: 'manager', icon: 'fas fa-user-tie', desc: 'Inventory + settings — all operations, warehouses, and can assign the staff role.' },
              { role: 'staff', icon: 'fas fa-user', desc: 'Inventory operations — dashboard, products, receipts, deliveries, transfers, and adjustments.' },
            ].map(({ role, icon, desc }) => (
              <div key={role} className="col-md-4">
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{
                    ...ROLE_STYLE[role],
                    width: 34, height: 34, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <i className={icon} style={{ fontSize: 13 }} />
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', textTransform: 'capitalize', marginBottom: 3 }}>{role}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.45 }}>{desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
