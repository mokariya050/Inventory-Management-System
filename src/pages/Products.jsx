import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import ProductModal from '../components/ProductModal'

const STOCK_BADGE = {
  ok: { cls: 'bg-success', label: 'OK' },
  low: { cls: 'bg-warning text-dark', label: 'Low' },
  out: { cls: 'bg-danger', label: 'Out' },
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalProduct, setModalProduct] = useState(null)   // null=closed, {}=new, {id:...}=edit
  const [showModal, setShowModal] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (catFilter) params.category_id = catFilter
    api.getProducts(params)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [search, catFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error)
  }, [])

  const openNew = () => { setModalProduct(null); setShowModal(true) }
  const openEdit = (p) => { setModalProduct(p); setShowModal(true) }
  const closeModal = (refreshed) => {
    setShowModal(false)
    if (refreshed) load()
  }

  return (
    <>
      <div className="d-sm-flex justify-content-between align-items-center mb-4">
        <h3 className="text-dark mb-0">Products</h3>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          <i className="fas fa-plus fa-sm me-1"></i> New Product
        </button>
      </div>

      {/* Filters */}
      <div className="card shadow mb-4">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text"><i className="fas fa-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search name or SKU…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-auto">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => { setSearch(''); setCatFilter('') }}>
                <i className="fas fa-times me-1"></i>Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow mb-4">
        <div className="card-body p-0">
          {loading
            ? <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>SKU</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>UOM</th>
                      <th className="text-end">Min Stock</th>
                      <th className="text-end">In Stock</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0
                      ? (
                        <tr>
                          <td colSpan={8} className="text-center text-muted py-4">
                            No products found.{' '}
                            <button className="btn btn-link p-0" onClick={openNew}>Add one.</button>
                          </td>
                        </tr>
                      )
                      : products.map((p) => {
                        const badge = STOCK_BADGE[p.stock_status] || STOCK_BADGE.ok
                        return (
                          <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => openEdit(p)}>
                            <td className="font-monospace small">{p.sku}</td>
                            <td className="fw-semibold">{p.name}</td>
                            <td className="text-muted small">{p.category}</td>
                            <td className="text-muted small">{p.unit_of_measure}</td>
                            <td className="text-end">{p.min_stock}</td>
                            <td className="text-end fw-bold">{p.total_stock}</td>
                            <td>
                              <span className={`badge ${badge.cls}`}>{badge.label}</span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={(e) => { e.stopPropagation(); openEdit(p) }}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
        {!loading && products.length > 0 && (
          <div className="card-footer text-muted small">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={modalProduct}
          categories={categories}
          onClose={closeModal}
          onCategoryCreated={(c) => setCategories((prev) => [...prev, c])}
        />
      )}
    </>
  )
}
