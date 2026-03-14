import { useState, useEffect } from 'react'
import { api } from '../../services/api'

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // New warehouse form
  const [whForm, setWhForm] = useState({ name: '', short_code: '', address: '' })
  const [whSaving, setWhSaving] = useState(false)
  const [showWhForm, setShowWhForm] = useState(false)

  // New location form (per warehouse)
  const [locForms, setLocForms] = useState({})  // warehouseId → {name, code}
  const [locSaving, setLocSaving] = useState({}) // warehouseId → bool

  const load = () => {
    setLoading(true)
    api.getWarehouses()
      .then(setWarehouses)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleCreateWarehouse = async (e) => {
    e.preventDefault()
    setWhSaving(true)
    setError('')
    try {
      await api.createWarehouse(whForm)
      setWhForm({ name: '', short_code: '', address: '' })
      setShowWhForm(false)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setWhSaving(false)
    }
  }

  const handleDeleteWarehouse = async (id) => {
    if (!window.confirm('Delete this warehouse? All its locations and stock data will be removed.')) return
    try {
      await api.deleteWarehouse(id)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCreateLocation = async (e, whId) => {
    e.preventDefault()
    setLocSaving((s) => ({ ...s, [whId]: true }))
    setError('')
    try {
      await api.createLocation(whId, locForms[whId] || {})
      setLocForms((f) => ({ ...f, [whId]: { name: '', code: '' } }))
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setLocSaving((s) => ({ ...s, [whId]: false }))
    }
  }

  const handleDeleteLocation = async (locId) => {
    if (!window.confirm('Delete this location?')) return
    try {
      await api.deleteLocation(locId)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const setLocForm = (whId, key, val) =>
    setLocForms((f) => ({ ...f, [whId]: { ...(f[whId] || {}), [key]: val } }))

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>

  return (
    <>
      <div className="d-sm-flex justify-content-between align-items-center mb-4">
        <h3 className="text-dark mb-0">
          <i className="fas fa-warehouse me-2 text-secondary"></i>Warehouses
        </h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowWhForm(true)}>
          <i className="fas fa-plus me-1"></i>Add Warehouse
        </button>
      </div>

      {error && <div className="alert alert-danger alert-dismissible">
        {error}
        <button type="button" className="btn-close" onClick={() => setError('')} />
      </div>}

      {/* New Warehouse Form */}
      {showWhForm && (
        <div className="card shadow mb-4 border-primary">
          <div className="card-header bg-primary text-white py-2">
            <h6 className="m-0">New Warehouse</h6>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateWarehouse}>
              <div className="row g-3">
                <div className="col-md-5">
                  <label className="form-label">Name <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    value={whForm.name}
                    onChange={(e) => setWhForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    placeholder="e.g. Main Warehouse"
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Code <span className="text-danger">*</span></label>
                  <input
                    className="form-control text-uppercase"
                    value={whForm.short_code}
                    onChange={(e) => setWhForm((f) => ({ ...f, short_code: e.target.value.toUpperCase() }))}
                    required
                    placeholder="MAIN"
                    maxLength={10}
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Address</label>
                  <input
                    className="form-control"
                    value={whForm.address}
                    onChange={(e) => setWhForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="Optional address"
                  />
                </div>
              </div>
              <div className="mt-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={whSaving}>
                  {whSaving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                  Create Warehouse
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowWhForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warehouse cards */}
      {warehouses.length === 0
        ? (
          <div className="card shadow">
            <div className="card-body text-center text-muted py-5">
              <i className="fas fa-warehouse fa-3x mb-3 d-block text-gray-300"></i>
              No warehouses yet. Add one to get started.
            </div>
          </div>
        )
        : warehouses.map((wh) => (
          <div key={wh.id} className="card shadow mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <span className="badge bg-secondary me-2">{wh.short_code}</span>
                <strong>{wh.name}</strong>
                {wh.address && <span className="text-muted small ms-2">{wh.address}</span>}
              </div>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDeleteWarehouse(wh.id)}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>

            <div className="card-body">
              <h6 className="text-secondary mb-3">Locations</h6>

              {/* Existing locations */}
              {(wh.locations || []).length === 0
                ? <p className="text-muted small">No locations yet.</p>
                : (
                  <table className="table table-sm table-bordered mb-3">
                    <thead className="table-light">
                      <tr><th>Code</th><th>Name</th><th></th></tr>
                    </thead>
                    <tbody>
                      {wh.locations.map((loc) => (
                        <tr key={loc.id}>
                          <td className="font-monospace small">{loc.code}</td>
                          <td>{loc.name}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteLocation(loc.id)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              }

              {/* Add location inline form */}
              <form className="d-flex gap-2 align-items-end" onSubmit={(e) => handleCreateLocation(e, wh.id)}>
                <div>
                  <label className="form-label form-label-sm mb-1">Location Name</label>
                  <input
                    className="form-control form-control-sm"
                    placeholder="e.g. Main Shelf"
                    value={locForms[wh.id]?.name || ''}
                    onChange={(e) => setLocForm(wh.id, 'name', e.target.value)}
                    required
                    style={{ width: 160 }}
                  />
                </div>
                <div>
                  <label className="form-label form-label-sm mb-1">Code</label>
                  <input
                    className="form-control form-control-sm text-uppercase"
                    placeholder="SHELF-A"
                    value={locForms[wh.id]?.code || ''}
                    onChange={(e) => setLocForm(wh.id, 'code', e.target.value.toUpperCase())}
                    required
                    style={{ width: 100 }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-sm btn-outline-primary"
                  disabled={locSaving[wh.id]}
                >
                  {locSaving[wh.id]
                    ? <span className="spinner-border spinner-border-sm" />
                    : <><i className="fas fa-plus me-1"></i>Add Location</>
                  }
                </button>
              </form>
            </div>
          </div>
        ))
      }
    </>
  )
}
