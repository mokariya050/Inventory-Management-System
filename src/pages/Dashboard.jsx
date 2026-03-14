import EarningsChart from '../components/charts/EarningsChart'
import RevenueChart from '../components/charts/RevenueChart'

export default function Dashboard() {
  return (
    <>
      <div className="d-sm-flex justify-content-between align-items-center mb-4">
        <h3 className="text-dark mb-0">Dashboard</h3>
        <a className="btn btn-primary btn-sm d-none d-sm-inline-block" role="button" href="#">
          <i className="fas fa-download fa-sm text-white-50"></i>&nbsp;Generate Report
        </a>
      </div>

      <div className="row">
        <div className="col-md-6 col-xl-3 mb-4">
          <div className="card shadow py-2 border-left-primary">
            <div className="card-body">
              <div className="row g-0 align-items-center">
                <div className="col me-2">
                  <div className="text-uppercase text-primary mb-1 fw-bold text-xs">
                    <span>Earnings (monthly)</span>
                  </div>
                  <div className="text-dark mb-0 fw-bold h5">
                    <span>$40,000</span>
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-calendar fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3 mb-4">
          <div className="card shadow py-2 border-left-success">
            <div className="card-body">
              <div className="row g-0 align-items-center">
                <div className="col me-2">
                  <div className="text-uppercase text-success mb-1 fw-bold text-xs">
                    <span>Earnings (annual)</span>
                  </div>
                  <div className="text-dark mb-0 fw-bold h5">
                    <span>$215,000</span>
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3 mb-4">
          <div className="card shadow py-2 border-left-info">
            <div className="card-body">
              <div className="row g-0 align-items-center">
                <div className="col me-2">
                  <div className="text-uppercase text-info mb-1 fw-bold text-xs">
                    <span>Tasks</span>
                  </div>
                  <div className="row g-0 align-items-center">
                    <div className="col-auto">
                      <div className="text-dark me-3 mb-0 fw-bold h5">
                        <span>50%</span>
                      </div>
                    </div>
                    <div className="col">
                      <div className="progress progress-sm">
                        <div
                          className="progress-bar bg-info"
                          aria-valuenow="50"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          style={{ width: '50%' }}
                        >
                          <span className="visually-hidden">50%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3 mb-4">
          <div className="card shadow py-2 border-left-warning">
            <div className="card-body">
              <div className="row g-0 align-items-center">
                <div className="col me-2">
                  <div className="text-uppercase text-warning mb-1 fw-bold text-xs">
                    <span>Pending Requests</span>
                  </div>
                  <div className="text-dark mb-0 fw-bold h5">
                    <span>18</span>
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-comments fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-7 col-xl-8">
          <div className="card shadow mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="text-primary m-0 fw-bold">Earnings Overview</h6>
              <div className="dropdown no-arrow">
                <button
                  className="btn btn-link btn-sm dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  type="button"
                >
                  <i className="fas fa-ellipsis-v text-gray-400"></i>
                </button>
                <div className="dropdown-menu shadow dropdown-menu-end animated--fade-in">
                  <p className="text-center dropdown-header">dropdown header:</p>
                  <a className="dropdown-item" href="#">&nbsp;Action</a>
                  <a className="dropdown-item" href="#">&nbsp;Another action</a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#">&nbsp;Something else here</a>
                </div>
              </div>
            </div>
            <div className="card-body">
              <EarningsChart />
            </div>
          </div>
        </div>
        <div className="col-lg-5 col-xl-4">
          <div className="card shadow mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="text-primary m-0 fw-bold">Revenue Sources</h6>
              <div className="dropdown no-arrow">
                <button
                  className="btn btn-link btn-sm dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  type="button"
                >
                  <i className="fas fa-ellipsis-v text-gray-400"></i>
                </button>
                <div className="dropdown-menu shadow dropdown-menu-end animated--fade-in">
                  <p className="text-center dropdown-header">dropdown header:</p>
                  <a className="dropdown-item" href="#">&nbsp;Action</a>
                  <a className="dropdown-item" href="#">&nbsp;Another action</a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#">&nbsp;Something else here</a>
                </div>
              </div>
            </div>
            <div className="card-body">
              <RevenueChart />
              <div className="text-center mt-4 small">
                <span className="me-2">
                  <i className="fas fa-circle text-primary"></i>&nbsp;Direct
                </span>
                <span className="me-2">
                  <i className="fas fa-circle text-success"></i>&nbsp;Social
                </span>
                <span className="me-2">
                  <i className="fas fa-circle text-info"></i>&nbsp;Refferal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="text-primary m-0 fw-bold">Projects</h6>
            </div>
            <div className="card-body">
              <h4 className="small fw-bold">
                Server migration<span className="float-end">20%</span>
              </h4>
              <div className="progress mb-4">
                <div
                  className="progress-bar bg-danger"
                  aria-valuenow="20"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style={{ width: '20%' }}
                >
                  <span className="visually-hidden">20%</span>
                </div>
              </div>
              <h4 className="small fw-bold">
                Sales tracking<span className="float-end">40%</span>
              </h4>
              <div className="progress mb-4">
                <div
                  className="progress-bar bg-warning"
                  aria-valuenow="40"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style={{ width: '40%' }}
                >
                  <span className="visually-hidden">40%</span>
                </div>
              </div>
              <h4 className="small fw-bold">
                Customer Database<span className="float-end">60%</span>
              </h4>
              <div className="progress mb-4">
                <div
                  className="progress-bar bg-primary"
                  aria-valuenow="60"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style={{ width: '60%' }}
                >
                  <span className="visually-hidden">60%</span>
                </div>
              </div>
              <h4 className="small fw-bold">
                Payout Details<span className="float-end">80%</span>
              </h4>
              <div className="progress mb-4">
                <div
                  className="progress-bar bg-info"
                  aria-valuenow="80"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style={{ width: '80%' }}
                >
                  <span className="visually-hidden">80%</span>
                </div>
              </div>
              <h4 className="small fw-bold">
                Account setup<span className="float-end">Complete!</span>
              </h4>
              <div className="progress mb-4">
                <div
                  className="progress-bar bg-success"
                  aria-valuenow="100"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style={{ width: '100%' }}
                >
                  <span className="visually-hidden">100%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="text-primary m-0 fw-bold">Todo List</h6>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <div className="row g-0 align-items-center">
                  <div className="col me-2">
                    <h6 className="mb-0">
                      <strong>Lunch meeting</strong>
                    </h6>
                    <span className="text-xs">10:30 AM</span>
                  </div>
                  <div className="col-auto">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="formCheck-1" />
                      <label className="form-check-label" htmlFor="formCheck-1"></label>
                    </div>
                  </div>
                </div>
              </li>
              <li className="list-group-item">
                <div className="row g-0 align-items-center">
                  <div className="col me-2">
                    <h6 className="mb-0">
                      <strong>Lunch meeting</strong>
                    </h6>
                    <span className="text-xs">11:30 AM</span>
                  </div>
                  <div className="col-auto">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="formCheck-2" />
                      <label className="form-check-label" htmlFor="formCheck-2"></label>
                    </div>
                  </div>
                </div>
              </li>
              <li className="list-group-item">
                <div className="row g-0 align-items-center">
                  <div className="col me-2">
                    <h6 className="mb-0">
                      <strong>Lunch meeting</strong>
                    </h6>
                    <span className="text-xs">12:30 AM</span>
                  </div>
                  <div className="col-auto">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="formCheck-3" />
                      <label className="form-check-label" htmlFor="formCheck-3"></label>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="col">
          <div className="row">
            <div className="col-lg-6 mb-4">
              <div className="card text-white bg-primary shadow">
                <div className="card-body">
                  <p className="m-0">Primary</p>
                  <p className="text-white-50 m-0 small">#4e73df</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-4">
              <div className="card text-white bg-success shadow">
                <div className="card-body">
                  <p className="m-0">Success</p>
                  <p className="text-white-50 m-0 small">#1cc88a</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-4">
              <div className="card text-white bg-info shadow">
                <div className="card-body">
                  <p className="m-0">Info</p>
                  <p className="text-white-50 m-0 small">#36b9cc</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-4">
              <div className="card text-white bg-warning shadow">
                <div className="card-body">
                  <p className="m-0">Warning</p>
                  <p className="text-white-50 m-0 small">#f6c23e</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-4">
              <div className="card text-white bg-danger shadow">
                <div className="card-body">
                  <p className="m-0">Danger</p>
                  <p className="text-white-50 m-0 small">#e74a3b</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-4">
              <div className="card text-white bg-secondary shadow">
                <div className="card-body">
                  <p className="m-0">Secondary</p>
                  <p className="text-white-50 m-0 small">#858796</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
