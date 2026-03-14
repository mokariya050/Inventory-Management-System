import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { api } from '../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const STATUS_BADGE = {
  receipt:    'bg-success',
  delivery:   'bg-primary',
  transfer:   'bg-info',
  adjustment: 'bg-warning',
}

export default function Dashboard() {
  const [stats, setStats]       = useState(null)
  const [chartData, setChartData] = useState([])
  const [typeFilter, setTypeFilter]     = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      api.getDashboardStats(),
      api.getDashboardStockByCategory(),
    ])
      .then(([s, c]) => {
        setStats(s)
        setChartData(c)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredMovements = (stats?.recent_movements || []).filter(
    (m) => !typeFilter || m.operation_type === typeFilter
  )

  const barData = {
    labels: chartData.map((r) => r.category),
    datasets: [
      {
        label: 'Units in Stock',
        data: chartData.map((r) => r.total_qty),
        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
        borderRadius: 4,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  }

  const KpiCard = ({ color, icon, label, value, to }) => (
    <div className="col-md-6 col-xl mb-4">
      <div className={`card shadow py-2 border-left-${color}`}>
        <div className="card-body">
          <div className="row g-0 align-items-center">
            <div className="col me-2">
              <div className={`text-uppercase text-${color} mb-1 fw-bold text-xs`}>{label}</div>
              <div className="text-dark mb-0 fw-bold h5">{loading ? '…' : value}</div>
            </div>
            <div className="col-auto">
              <i className={`${icon} fa-2x text-gray-300`}></i>
            </div>
          </div>
          {to && (
            <Link to={to} className={`small text-${color} mt-1 d-block`}>
              View all <i className="fas fa-arrow-right fa-xs"></i>
            </Link>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Header */}
      <div className="d-sm-flex justify-content-between align-items-center mb-4">
        <h3 className="text-dark mb-0">Dashboard</h3>
        <Link to="/products" className="btn btn-primary btn-sm d-none d-sm-inline-block">
          <i className="fas fa-box fa-sm text-white-50"></i>&nbsp;View Products
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="row">
        <KpiCard color="primary" icon="fas fa-boxes"
          label="Total Products" value={stats?.total_products ?? '—'} to="/products" />
        <KpiCard color="warning" icon="fas fa-exclamation-triangle"
          label="Low Stock" value={stats?.low_stock_count ?? '—'} to="/products" />
        <KpiCard color="danger" icon="fas fa-times-circle"
          label="Out of Stock" value={stats?.out_of_stock_count ?? '—'} to="/products" />
        <KpiCard color="success" icon="fas fa-truck-loading"
          label="Pending Receipts" value={stats?.pending_receipts ?? '—'} to="/operations/receipts" />
        <KpiCard color="info" icon="fas fa-truck"
          label="Pending Deliveries" value={stats?.pending_deliveries ?? '—'} to="/operations/deliveries" />
      </div>

      {/* Chart + Recent Movements */}
      <div className="row">
        {/* Bar Chart */}
        <div className="col-lg-7 mb-4">
          <div className="card shadow h-100">
            <div className="card-header py-3">
              <h6 className="text-primary m-0 fw-bold">Stock by Category</h6>
            </div>
            <div className="card-body">
              {chartData.length > 0
                ? <Bar data={barData} options={barOptions} />
                : <p className="text-muted text-center mt-4">No stock data yet.</p>
              }
            </div>
          </div>
        </div>

        {/* Recent Movements */}
        <div className="col-lg-5 mb-4">
          <div className="card shadow h-100">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="text-primary m-0 fw-bold">Recent Movements</h6>
              <select
                className="form-select form-select-sm w-auto"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="receipt">Receipt</option>
                <option value="delivery">Delivery</option>
                <option value="transfer">Transfer</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
            <div className="card-body p-0">
              {filteredMovements.length === 0
                ? <p className="text-muted text-center p-4">No movements yet.</p>
                : (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Product</th>
                          <th>Type</th>
                          <th className="text-end">Qty</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMovements.map((m) => (
                          <tr key={m.id}>
                            <td>
                              <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{m.product_name}</div>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{m.sku}</div>
                            </td>
                            <td>
                              <span className={`badge ${STATUS_BADGE[m.operation_type] || 'bg-secondary'}`}>
                                {m.operation_type}
                              </span>
                            </td>
                            <td className={`text-end fw-bold ${m.qty_change < 0 ? 'text-danger' : 'text-success'}`}>
                              {m.qty_change > 0 ? '+' : ''}{m.qty_change}
                            </td>
                            <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                              {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              }
              <div className="text-center py-2">
                <Link to="/move-history" className="small text-primary">
                  View full history <i className="fas fa-arrow-right fa-xs"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Table */}
      {(stats?.low_stock_count > 0 || stats?.out_of_stock_count > 0) && (
        <div className="row">
          <div className="col-12 mb-4">
            <div className="card shadow border-left-warning">
              <div className="card-header py-3 d-flex justify-content-between align-items-center">
                <h6 className="text-warning m-0 fw-bold">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Stock Alerts — {(stats.low_stock_count || 0) + (stats.out_of_stock_count || 0)} products need attention
                </h6>
                <Link to="/products" className="btn btn-sm btn-outline-warning">View Products</Link>
              </div>
              <div className="card-body p-0">
                <LowStockTable />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function LowStockTable() {
  const [items, setItems] = useState([])
  useEffect(() => {
    api.getLowStock().then(setItems).catch(console.error)
  }, [])

  if (!items.length) return null

  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>SKU</th>
            <th>Product</th>
            <th>Category</th>
            <th className="text-end">In Stock</th>
            <th className="text-end">Min Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td className="text-monospace small">{p.sku}</td>
              <td>{p.name}</td>
              <td className="text-muted small">{p.category}</td>
              <td className="text-end fw-bold text-danger">{p.stock}</td>
              <td className="text-end text-muted">{p.min_stock}</td>
              <td>
                {p.stock === 0
                  ? <span className="badge bg-danger">Out of Stock</span>
                  : <span className="badge bg-warning text-dark">Low Stock</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
