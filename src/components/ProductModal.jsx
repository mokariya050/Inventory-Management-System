import { useState, useEffect } from 'react'
import { api } from '../services/api'

const EMPTY = { sku: '', name: '', category_id: '', unit_of_measure: 'unit', min_stock: 0 }

export default function ProductModal({ product, categories, onClose, onCategoryCreated }) {
  const isEdit = Boolean(product?.id)
  const [form, setForm] = useState(isEdit ? { ...product } : { ...EMPTY })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [newCat, setNewCat] = useState('')
  const [addingCat, setAddingCat] = useState(false)
  const [stockByLoc, setStockByLoc] = useState([])

  useEffect(() => {
    if (isEdit && product.id) {
      api.getProduct(product.id)
        .then((p) => setStockByLoc(p.stock_by_location || []))
        .catch(console.error)
    }
  }, [isEdit, product?.id])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        category_id: form.category_id || null,
        min_stock: parseInt(form.min_stock) || 0,
      }
      if (isEdit) {
        await api.updateProduct(product.id, payload)
      } else {
        await api.createProduct(payload)
      }
      onClose(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return
    setLoading(true)
    try {
      await api.deleteProduct(product.id)
      onClose(true)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCat.trim()) return
    setAddingCat(true)
    try {
      const cat = await api.createCategory({ name: newCat.trim() })
      onCategoryCreated(cat)
      setForm((f) => ({ ...f, category_id: String(cat.id) }))
      setNewCat('')
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingCat(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={() => onClose(false)} style={{ zIndex: 1040 }} />

      {/* Modal */}
      <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow">
            <div className="modal-header">
              <h5 className="modal-title">{isEdit ? 'Edit Product' : 'New Product'}</h5>
              <button type="button" className="btn-close" onClick={() => onClose(false)} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger py-2">{error}</div>}

                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">SKU <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      value={form.sku}
                      onChange={(e) => set('sku', e.target.value)}
                      required
                      placeholder="e.g. ELEC-001"
                    />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label">Name <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      required
                      placeholder="Product name"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <div className="input-group">
                      <select
                        className="form-select"
                        value={form.category_id || ''}
                        onChange={(e) => set('category_id', e.target.value)}
                      >
                        <option value="">— None —</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    {/* Inline add category */}
                    <div className="input-group mt-1">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Add new category…"
                        value={newCat}
                        onChange={(e) => setNewCat(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={handleAddCategory}
                        disabled={addingCat || !newCat.trim()}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Unit of Measure</label>
                    <input
                      className="form-control"
                      value={form.unit_of_measure}
                      onChange={(e) => set('unit_of_measure', e.target.value)}
                      placeholder="unit, box, kg…"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Min Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      value={form.min_stock}
                      onChange={(e) => set('min_stock', e.target.value)}
                    />
                  </div>
                </div>

                {/* Stock by location (edit only) */}
                {isEdit && stockByLoc.length > 0 && (
                  <div className="mt-4">
                    <h6 className="text-secondary">Stock by Location</h6>
                    <table className="table table-sm table-bordered">
                      <thead className="table-light">
                        <tr><th>Warehouse</th><th>Location</th><th className="text-end">Qty</th></tr>
                      </thead>
                      <tbody>
                        {stockByLoc.map((s) => (
                          <tr key={s.location_id}>
                            <td>{s.warehouse_name}</td>
                            <td>{s.location_name}</td>
                            <td className="text-end fw-bold">{s.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {isEdit && (
                  <button
                    type="button"
                    className="btn btn-outline-danger me-auto"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    <i className="fas fa-trash me-1"></i>Delete
                  </button>
                )}
                <button type="button" className="btn btn-secondary" onClick={() => onClose(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading
                    ? <span className="spinner-border spinner-border-sm me-1" />
                    : <i className={`fas fa-${isEdit ? 'save' : 'plus'} me-1`}></i>
                  }
                  {isEdit ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
