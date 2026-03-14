import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'

const STATUS_BADGES = {
  draft: 'bg-secondary',
  ready: 'bg-primary',
  done: 'bg-success',
  canceled: 'bg-danger',
}

const TYPE_CONFIG = {
  receipts: {
    title: 'Receipts',
    icon: 'fas fa-truck-loading',
    color: 'success',
    newLabel: 'New Receipt',
    cols: ['Ref', 'Supplier', 'Location', 'Lines', 'Status', 'Date'],
  },
  deliveries: {
    title: 'Deliveries',
    icon: 'fas fa-truck',
    color: 'primary',
    newLabel: 'New Delivery',
    cols: ['Ref', 'Customer', 'Location', 'Lines', 'Status', 'Date'],
  },
  transfers: {
    title: 'Transfers',
    icon: 'fas fa-exchange-alt',
    color: 'info',
    newLabel: 'New Transfer',
    cols: ['Ref', 'From', 'To', 'Lines', 'Status', 'Date'],
  },
  adjustments: {
    title: 'Adjustments',
    icon: 'fas fa-sliders-h',
    color: 'warning',
    newLabel: 'New Adjustment',
    cols: ['Ref', 'Location', 'Lines', 'Status', 'Date'],
  },
}

function renderSecondary(type, row) {
  if (type === 'receipts') return row.supplier_name || '—'
  if (type === 'deliveries') return row.customer_name || '—'
  if (type === 'transfers') return `${row.from_location || '—'} (${row.from_warehouse || ''})`
  if (type === 'adjustments') return `${row.location_name || '—'}`
  return '—'
}
function renderThird(type, row) {
  if (type === 'receipts') return `${row.location_name || '—'} (${row.warehouse_name || ''})`
  if (type === 'deliveries') return `${row.location_name || '—'} (${row.warehouse_name || ''})`
  if (type === 'transfers') return `${row.to_location || '—'} (${row.to_warehouse || ''})`
  return null
}

export default function OperationList({ type }) {
  const cfg = TYPE_CONFIG[type]
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [statusFilter, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const params = statusFilter ? { status: statusFilter } : {}
    api.getOperations(type, params)
      .then(setRows)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [type, statusFilter])

  useEffect(() => { load() }, [load])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Delete this draft?')) return
    try {
      await api.deleteOperation(type, id)
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <>
      <div className="d-sm-flex justify-content-between align-items-center mb-4">
        <h3 className="text-dark mb-0">
          <i className={`${cfg.icon} me-2 text-${cfg.color}`}></i>{cfg.title}
        </h3>
        <Link to={`/operations/${type}/new`} className={`btn btn-${cfg.color} btn-sm`}>
          <i className="fas fa-plus fa-sm me-1"></i>{cfg.newLabel}
        </Link>
      </div>

      {/* Status tabs */}
      <ul className="nav nav-tabs mb-3">
        {['', 'draft', 'ready', 'done', 'canceled'].map((s) => (
          <li key={s} className="nav-item">
            <button
              className={`nav-link${statusFilter === s ? ' active' : ''}`}
              onClick={() => setStatus(s)}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== '' && (
                <span className={`badge ms-1 ${STATUS_BADGES[s]}`}>
                  {rows.filter((r) => r.status === s).length > 0
                    ? rows.filter((r) => r.status === s).length : ''}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="card shadow mb-4">
        <div className="card-body p-0">
          {loading
            ? <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      {cfg.cols.map((c) => <th key={c}>{c}</th>)}
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0
                      ? (
                        <tr>
                          <td colSpan={cfg.cols.length + 1} className="text-center text-muted py-4">
                            No {cfg.title.toLowerCase()} found.{' '}
                            <Link to={`/operations/${type}/new`}>Create one.</Link>
                          </td>
                        </tr>
                      )
                      : rows.map((row) => (
                        <tr
                          key={row.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/operations/${type}/${row.id}`)}
                        >
                          <td className="font-monospace small fw-semibold">{row.ref}</td>
                          <td>{renderSecondary(type, row)}</td>
                          {renderThird(type, row) !== null && <td className="text-muted small">{renderThird(type, row)}</td>}
                          <td className="text-center">{row.line_count ?? 0}</td>
                          <td>
                            <span className={`badge ${STATUS_BADGES[row.status]}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="text-muted small">
                            {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            {row.status !== 'done' && row.status !== 'canceled' && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={(e) => handleDelete(e, row.id)}
                                title="Delete"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
        {!loading && rows.length > 0 && (
          <div className="card-footer text-muted small">{rows.length} record{rows.length !== 1 ? 's' : ''}</div>
        )}
      </div>
    </>
  )
}
