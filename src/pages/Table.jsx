import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

export default function Table() {
  const [employees, setEmployees] = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [pageSize, setPageSize]   = useState(10)
  const [search, setSearch]       = useState('')
  const [searchInput, setSearchInput] = useState('')

  const fetchEmployees = useCallback(() => {
    api.getEmployees({ page, pageSize, search })
      .then((res) => { setEmployees(res.data); setTotal(res.total) })
      .catch(console.error)
  }, [page, pageSize, search])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  const totalPages = Math.ceil(total / pageSize)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value))
    setPage(1)
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end   = Math.min(page * pageSize, total)

  return (
    <>
      <h3 className="text-dark mb-4">Team</h3>
      <div className="card shadow">
        <div className="card-header py-3">
          <p className="text-primary m-0 fw-bold">Employee Info</p>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 text-nowrap">
              <div className="dataTables_length" aria-controls="dataTable">
                <label className="form-label">
                  Show&nbsp;
                  <select
                    className="d-inline-block form-select form-select-sm"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  &nbsp;
                </label>
              </div>
            </div>
            <div className="col-md-6">
              <div className="text-md-end dataTables_filter">
                <form onSubmit={handleSearchSubmit} className="d-inline">
                  <label className="form-label">
                    <input
                      type="search"
                      className="form-control form-control-sm"
                      aria-controls="dataTable"
                      placeholder="Search"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </label>
                </form>
              </div>
            </div>
          </div>
          <div className="table-responsive mt-2 table" role="grid" aria-describedby="dataTable_info">
            <table className="table my-0" id="dataTable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Office</th>
                  <th>Age</th>
                  <th>Start date</th>
                  <th>Salary</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <img
                        className="rounded-circle me-2"
                        width="30"
                        height="30"
                        src={emp.avatarUrl}
                        alt=""
                      />
                      {emp.name}
                    </td>
                    <td>{emp.position}</td>
                    <td>{emp.office}</td>
                    <td>{emp.age}</td>
                    <td>{emp.startDate}</td>
                    <td>${Number(emp.salary).toLocaleString()}</td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-3">No results found</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Name</strong></td>
                  <td><strong>Position</strong></td>
                  <td><strong>Office</strong></td>
                  <td><strong>Age</strong></td>
                  <td><strong>Start date</strong></td>
                  <td><strong>Salary</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="row">
            <div className="col-md-6 align-self-center">
              <p id="dataTable_info" className="dataTables_info" role="status" aria-live="polite">
                {total > 0 ? `Showing ${start} to ${end} of ${total}` : 'No entries'}
              </p>
            </div>
            <div className="col-md-6">
              <nav className="d-lg-flex justify-content-lg-end dataTables_paginate paging_simple_numbers">
                <ul className="pagination">
                  <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>
                      <span aria-hidden="true">«</span>
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <li key={p} className={`page-item${p === page ? ' active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                    </li>
                  ))}
                  <li className={`page-item${page === totalPages || totalPages === 0 ? ' disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages || totalPages === 0}
                    >
                      <span aria-hidden="true">»</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
