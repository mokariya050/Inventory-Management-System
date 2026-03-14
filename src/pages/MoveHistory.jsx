import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const TYPE_BADGE = {
  receipt: 'bg-success',
  delivery: 'bg-primary',
  transfer: 'bg-info',
  adjustment: 'bg-warning text-dark',
}

const TYPE_LABELS = {
  receipt: 'Receipt',
  delivery: 'Delivery',
  transfer: 'Transfer',
  adjustment: 'Adjustment',
}

export default function MoveHistory() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])

  // Filters
  const [productFilter, setProductFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')

  const perPage = 25

  const load = useCallback(() => {
    setLoading(true)
    const params = { page, per_page: perPage }
    if (productFilter) params.product_id = productFilter
    if (typeFilter) params.type = typeFilter
    if (locationFilter) params.location_id = locationFilter
    api.getStockLedger(params)
      .then((d) => { setItems(d.items); setTotal(d.total) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, productFilter, typeFilter, locationFilter])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    api.getProducts().then(setProducts).catch(console.error)
    api.getWarehouses().then(setWarehouses).catch(console.error)
  }, [])

  const allLocations = warehouses.flatMap((wh) =>
    (wh.locations || []).map((l) => ({ ...l, warehouse_name: wh.name }))
  )

  const totalPages = Math.ceil(total / perPage)

  const resetFilters = () => {
    setProductFilter('')
    setTypeFilter('')
    setLocationFilter('')
    setPage(1)
  }

  return (
    <>
      <div className="d-sm-flex justify-content-between align-items-center mb-4">
        <h3 className="text-dark mb-0">
          <i className="fas fa-history me-2 text-secondary"></i>Move History
        </h3>
        <span className="badge bg-secondary">{total} records</span>
      </div>

      {/* Filters */}
      <div className="card shadow mb-4">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={productFilter}
                onChange={(e) => { setProductFilter(e.target.value); setPage(1) }}
              >
                <option value="">All Products</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.sku} – {p.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select form-select-sm"
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
              >
                <option value="">All Types</option>
                <option value="receipt">Receipt</option>
                <option value="delivery">Delivery</option>
                <option value="transfer">Transfer</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={locationFilter}
                onChange={(e) => { setLocationFilter(e.target.value); setPage(1) }}
              >
                <option value="">All Locations</option>
                {allLocations.map((l) => (
                  <option key={l.id} value={l.id}>{l.warehouse_name} / {l.name}</option>
                ))}
              </select>
            </div>
            <div className="col-auto">
              <button className="btn btn-sm btn-outline-secondary" onClick={resetFilters}>
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
                      <th>Date</th>
                      <th>Product</th>
                      <th>Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th className="text-end">Qty Change</th>
                      <th>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0
                      ? (
                        <tr>
                          <td colSpan={7} className="text-center text-muted py-4">
                            No movements found.
                          </td>
                        </tr>
                      )
                      : items.map((m) => (
                        <tr key={m.id}>
                          <td className="text-muted small">
                            {m.created_at ? new Date(m.created_at).toLocaleString() : '—'}
                          </td>
                          <td>
                            <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{m.product_name}</div>
                            <div className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>{m.sku}</div>
                          </td>
                          <td>
                            <span className={`badge ${TYPE_BADGE[m.operation_type] || 'bg-secondary'}`}>
                              {TYPE_LABELS[m.operation_type] || m.operation_type}
                            </span>
                          </td>
                          <td className="text-muted small">
                            {m.from_location
                              ? <><i className="fas fa-map-marker-alt me-1"></i>{m.from_warehouse} / {m.from_location}</>
                              : '—'}
                          </td>
                          <td className="text-muted small">
                            {m.to_location
                              ? <><i className="fas fa-map-marker-alt me-1"></i>{m.to_warehouse} / {m.to_location}</>
                              : '—'}
                          </td>
                          <td className={`text-end fw-bold ${m.qty_change < 0 ? 'text-danger' : 'text-success'}`}>
                            {m.qty_change > 0 ? '+' : ''}{m.qty_change}
                          </td>
                          <td className="font-monospace small text-muted">
                            #{m.reference_id} ({m.reference_type})
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Page {page} of {totalPages} ({total} records)
            </small>
            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
