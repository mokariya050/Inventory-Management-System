import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../../services/api'

const TYPE_META = {
  receipts: {
    title: 'Receipt',
    icon: 'fas fa-truck-loading',
    color: 'success',
    refPrefix: 'Incoming Stock',
  },
  deliveries: {
    title: 'Delivery Order',
    icon: 'fas fa-truck',
    color: 'primary',
    refPrefix: 'Outgoing Stock',
  },
  transfers: {
    title: 'Internal Transfer',
    icon: 'fas fa-exchange-alt',
    color: 'info',
    refPrefix: 'Stock Transfer',
  },
  adjustments: {
    title: 'Inventory Adjustment',
    icon: 'fas fa-sliders-h',
    color: 'warning',
    refPrefix: 'Stock Count',
  },
}

const STATUS_BADGE = {
  draft: 'secondary',
  ready: 'primary',
  done: 'success',
  canceled: 'danger',
}

const EMPTY_LINE = { product_id: '', qty_expected: 1, qty_ordered: 1, qty_done: 0, qty: 1, qty_system: 0, qty_counted: 0 }

export default function OperationForm({ type }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'
  const meta = TYPE_META[type]

  const [doc, setDoc] = useState(null)
  const [header, setHeader] = useState({
    location_id: '', from_location_id: '', to_location_id: '',
    supplier_id: '', customer_name: '', notes: '',
  })
  const [lines, setLines] = useState([{ ...EMPTY_LINE }])
  const [products, setProducts] = useState([])
  const [locations, setLocations] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Load reference data
  useEffect(() => {
    api.getWarehouses()
      .then((whs) => {
        const locs = whs.flatMap((wh) =>
          (wh.locations || []).map((l) => ({ ...l, warehouse_name: wh.name }))
        )
        setLocations(locs)
      })
      .catch(console.error)
    api.getProducts()
      .then(setProducts)
      .catch(console.error)
    if (type === 'receipts') {
      api.getSuppliers().then(setSuppliers).catch(console.error)
    }
  }, [type])

  // Load existing doc
  useEffect(() => {
    if (!isNew) {
      setLoading(true)
      api.getOperation(type, id)
        .then((d) => {
          setDoc(d)
          setHeader({
            location_id: String(d.location_id || ''),
            from_location_id: String(d.from_location_id || ''),
            to_location_id: String(d.to_location_id || ''),
            supplier_id: String(d.supplier_id || ''),
            customer_name: d.customer_name || '',
            notes: d.notes || '',
          })
          setLines(
            (d.lines || []).map((l) => ({
              ...EMPTY_LINE,
              ...l,
              product_id: String(l.product_id),
            }))
          )
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [isNew, type, id])

  const readOnly = doc?.status === 'done' || doc?.status === 'canceled'

  const addLine = () => setLines((ls) => [...ls, { ...EMPTY_LINE }])
  const removeLine = (i) => setLines((ls) => ls.filter((_, idx) => idx !== i))
  const setLine = (i, key, val) =>
    setLines((ls) => ls.map((l, idx) => idx === i ? { ...l, [key]: val } : l))
  const setHdr = (k, v) => setHeader((h) => ({ ...h, [k]: v }))

  const buildPayload = (extraStatus) => {
    const payload = { notes: header.notes || null }
    if (extraStatus) payload.status = extraStatus
    // Header fields by type
    if (type === 'receipts') {
      payload.location_id = parseInt(header.location_id) || null
      payload.supplier_id = parseInt(header.supplier_id) || null
    } else if (type === 'deliveries') {
      payload.location_id = parseInt(header.location_id) || null
      payload.customer_name = header.customer_name || null
    } else if (type === 'transfers') {
      payload.from_location_id = parseInt(header.from_location_id) || null
      payload.to_location_id = parseInt(header.to_location_id) || null
    } else if (type === 'adjustments') {
      payload.location_id = parseInt(header.location_id) || null
    }
    payload.lines = lines
      .filter((l) => l.product_id)
      .map((l) => {
        const base = { product_id: parseInt(l.product_id) }
        if (type === 'receipts') return { ...base, qty_expected: parseInt(l.qty_expected) || 0, qty_done: parseInt(l.qty_done) || 0 }
        if (type === 'deliveries') return { ...base, qty_ordered: parseInt(l.qty_ordered) || 0, qty_done: parseInt(l.qty_done) || 0 }
        if (type === 'transfers') return { ...base, qty: parseInt(l.qty) || 0 }
        if (type === 'adjustments') return { ...base, qty_counted: parseInt(l.qty_counted) || 0 }
        return base
      })
    return payload
  }

  const save = async (status = null) => {
    setSaving(true)
    setError('')
    try {
      if (isNew) {
        const payload = buildPayload(status)
        const created = await api.createOperation(type, payload)
        navigate(`/operations/${type}/${created.id}`)
      } else {
        const payload = buildPayload(status)
        const updated = await api.updateOperation(type, id, payload)
        setDoc(updated)
        setLines((updated.lines || []).map((l) => ({ ...EMPTY_LINE, ...l, product_id: String(l.product_id) })))
        setHeader({
          location_id: String(updated.location_id || ''),
          from_location_id: String(updated.from_location_id || ''),
          to_location_id: String(updated.to_location_id || ''),
          supplier_id: String(updated.supplier_id || ''),
          customer_name: updated.customer_name || '',
          notes: updated.notes || '',
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const validate = async () => {
    setSaving(true)
    setError('')
    try {
      const updated = await api.validateOperation(type, id)
      setDoc(updated)
      navigate(`/operations/${type}`)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const LocationSelect = ({ field }) => (
    <select
      className="form-select"
      value={header[field]}
      onChange={(e) => setHdr(field, e.target.value)}
      disabled={readOnly}
      required
    >
      <option value="">— Select location —</option>
      {locations.map((l) => (
        <option key={l.id} value={String(l.id)}>
          {l.warehouse_name} / {l.name} ({l.code})
        </option>
      ))}
    </select>
  )

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>

  return (
    <>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Link to={`/operations/${type}`} className="text-secondary small me-2">
            <i className="fas fa-arrow-left"></i> {meta.title}s
          </Link>
          <h4 className="mb-0 mt-1">
            <i className={`${meta.icon} me-2 text-${meta.color}`}></i>
            {isNew ? `New ${meta.title}` : doc?.ref}
          </h4>
        </div>
        {doc && (
          <span className={`badge bg-${STATUS_BADGE[doc.status] || 'secondary'} fs-6`}>
            {doc.status}
          </span>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        {/* Left column: header fields */}
        <div className="col-lg-4">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 fw-bold text-primary">{meta.refPrefix}</h6>
            </div>
            <div className="card-body">
              {/* Type-specific header fields */}
              {(type === 'receipts') && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Receiving Location <span className="text-danger">*</span></label>
                    <LocationSelect field="location_id" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Supplier</label>
                    <select
                      className="form-select"
                      value={header.supplier_id}
                      onChange={(e) => setHdr('supplier_id', e.target.value)}
                      disabled={readOnly}
                    >
                      <option value="">— No supplier —</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={String(s.id)}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {(type === 'deliveries') && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Shipping From <span className="text-danger">*</span></label>
                    <LocationSelect field="location_id" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Customer Name</label>
                    <input
                      className="form-control"
                      value={header.customer_name}
                      onChange={(e) => setHdr('customer_name', e.target.value)}
                      disabled={readOnly}
                      placeholder="Customer / recipient"
                    />
                  </div>
                </>
              )}

              {(type === 'transfers') && (
                <>
                  <div className="mb-3">
                    <label className="form-label">From Location <span className="text-danger">*</span></label>
                    <LocationSelect field="from_location_id" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">To Location <span className="text-danger">*</span></label>
                    <LocationSelect field="to_location_id" />
                  </div>
                </>
              )}

              {(type === 'adjustments') && (
                <div className="mb-3">
                  <label className="form-label">Location <span className="text-danger">*</span></label>
                  <LocationSelect field="location_id" />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={header.notes}
                  onChange={(e) => setHdr('notes', e.target.value)}
                  disabled={readOnly}
                  placeholder="Optional notes…"
                />
              </div>

              {doc && (
                <div className="text-muted small">
                  <div>Created: {new Date(doc.created_at).toLocaleString()}</div>
                  {doc.validated_at && <div>Validated: {new Date(doc.validated_at).toLocaleString()}</div>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: product lines */}
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="m-0 fw-bold text-primary">Product Lines</h6>
              {!readOnly && (
                <button className="btn btn-sm btn-outline-primary" onClick={addLine}>
                  <i className="fas fa-plus me-1"></i>Add Line
                </button>
              )}
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: 200 }}>Product</th>
                      {type === 'receipts' && <><th className="text-end">Expected</th><th className="text-end">Received</th></>}
                      {type === 'deliveries' && <><th className="text-end">Ordered</th><th className="text-end">Delivered</th></>}
                      {type === 'transfers' && <th className="text-end">Qty</th>}
                      {type === 'adjustments' && <><th className="text-end">System Qty</th><th className="text-end">Counted Qty</th></>}
                      {!readOnly && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, i) => (
                      <tr key={i}>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={line.product_id}
                            onChange={(e) => setLine(i, 'product_id', e.target.value)}
                            disabled={readOnly}
                          >
                            <option value="">— Select product —</option>
                            {products.map((p) => (
                              <option key={p.id} value={String(p.id)}>
                                {p.sku} – {p.name}
                              </option>
                            ))}
                          </select>
                          {line.product_name && (
                            <small className="text-muted">{line.product_name}</small>
                          )}
                        </td>
                        {type === 'receipts' && (
                          <>
                            <td>
                              <input
                                type="number" min="0"
                                className="form-control form-control-sm text-end"
                                value={line.qty_expected}
                                onChange={(e) => setLine(i, 'qty_expected', e.target.value)}
                                disabled={readOnly}
                                style={{ width: 80 }}
                              />
                            </td>
                            <td>
                              <input
                                type="number" min="0"
                                className="form-control form-control-sm text-end"
                                value={line.qty_done}
                                onChange={(e) => setLine(i, 'qty_done', e.target.value)}
                                disabled={doc?.status !== 'ready'}
                                style={{ width: 80 }}
                              />
                            </td>
                          </>
                        )}
                        {type === 'deliveries' && (
                          <>
                            <td>
                              <input
                                type="number" min="0"
                                className="form-control form-control-sm text-end"
                                value={line.qty_ordered}
                                onChange={(e) => setLine(i, 'qty_ordered', e.target.value)}
                                disabled={readOnly}
                                style={{ width: 80 }}
                              />
                            </td>
                            <td>
                              <input
                                type="number" min="0"
                                className="form-control form-control-sm text-end"
                                value={line.qty_done}
                                onChange={(e) => setLine(i, 'qty_done', e.target.value)}
                                disabled={doc?.status !== 'ready'}
                                style={{ width: 80 }}
                              />
                            </td>
                          </>
                        )}
                        {type === 'transfers' && (
                          <td>
                            <input
                              type="number" min="0"
                              className="form-control form-control-sm text-end"
                              value={line.qty}
                              onChange={(e) => setLine(i, 'qty', e.target.value)}
                              disabled={readOnly}
                              style={{ width: 80 }}
                            />
                          </td>
                        )}
                        {type === 'adjustments' && (
                          <>
                            <td className="text-end align-middle text-muted">{line.qty_system}</td>
                            <td>
                              <input
                                type="number" min="0"
                                className="form-control form-control-sm text-end"
                                value={line.qty_counted}
                                onChange={(e) => setLine(i, 'qty_counted', e.target.value)}
                                disabled={readOnly}
                                style={{ width: 80 }}
                              />
                            </td>
                          </>
                        )}
                        {!readOnly && (
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeLine(i)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {!readOnly && (
        <div className="mt-4 d-flex gap-2 flex-wrap">
          {/* Always available: Save Draft */}
          <button
            className="btn btn-outline-secondary"
            onClick={() => save('draft')}
            disabled={saving}
          >
            {saving ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="fas fa-save me-1"></i>}
            Save Draft
          </button>

          {/* Available from draft → mark ready */}
          {(isNew || doc?.status === 'draft') && (
            <button
              className="btn btn-primary"
              onClick={() => save('ready')}
              disabled={saving}
            >
              <i className="fas fa-check me-1"></i>Mark as Ready
            </button>
          )}

          {/* Available from ready → validate */}
          {!isNew && doc?.status === 'ready' && (
            <button
              className={`btn btn-${meta.color}`}
              onClick={validate}
              disabled={saving}
            >
              {saving ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="fas fa-check-double me-1"></i>}
              Validate
            </button>
          )}

          {/* Cancel */}
          {!isNew && (
            <button
              className="btn btn-outline-danger ms-auto"
              onClick={() => save('canceled')}
              disabled={saving}
            >
              <i className="fas fa-ban me-1"></i>Cancel
            </button>
          )}
        </div>
      )}

      {readOnly && (
        <div className="mt-4">
          <Link to={`/operations/${type}`} className={`btn btn-${meta.color}`}>
            <i className="fas fa-arrow-left me-1"></i>Back to {meta.title}s
          </Link>
        </div>
      )}
    </>
  )
}
