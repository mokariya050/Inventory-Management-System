import { useSidebar } from '../context/SidebarContext'

export default function Topbar() {
  const { toggleSidebar } = useSidebar()

  return (
    <nav className="navbar navbar-expand bg-white shadow mb-4 topbar">
      <div className="container-fluid">
        <button
          className="btn btn-link d-md-none me-3 rounded-circle"
          id="sidebarToggleTop"
          onClick={toggleSidebar}
          type="button"
        >
          <i className="fas fa-bars"></i>
        </button>
        <ul className="navbar-nav flex-nowrap ms-auto">
          <li className="nav-item dropdown d-sm-none no-arrow">
            <a
              className="dropdown-toggle nav-link"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              href="#"
            >
              <i className="fas fa-search"></i>
            </a>
            <div
              className="dropdown-menu p-3 dropdown-menu-end animated--grow-in"
              aria-labelledby="searchDropdown"
            >
              <form className="w-100 me-auto navbar-search">
                <div className="input-group">
                  <input
                    className="bg-light border-0 form-control small"
                    type="text"
                    placeholder="Search for ..."
                  />
                  <button className="btn btn-primary" type="button">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </form>
            </div>
          </li>
          <li className="nav-item mx-1 dropdown no-arrow">
            <div className="nav-item dropdown no-arrow">
              <a
                className="dropdown-toggle nav-link"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                href="#"
              >
                <span className="badge bg-danger badge-counter">3+</span>
                <i className="fas fa-bell fa-fw"></i>
              </a>
              <div className="dropdown-menu dropdown-menu-end dropdown-list animated--grow-in">
                <h6 className="dropdown-header">alerts center</h6>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <div className="me-3">
                    <div className="bg-primary icon-circle">
                      <i className="fas fa-file-alt text-white"></i>
                    </div>
                  </div>
                  <div>
                    <span className="small text-gray-500">December 12, 2019</span>
                    <p>A new monthly report is ready to download!</p>
                  </div>
                </a>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <div className="me-3">
                    <div className="bg-success icon-circle">
                      <i className="fas fa-donate text-white"></i>
                    </div>
                  </div>
                  <div>
                    <span className="small text-gray-500">December 7, 2019</span>
                    <p>$290.29 has been deposited into your account!</p>
                  </div>
                </a>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <div className="me-3">
                    <div className="bg-warning icon-circle">
                      <i className="fas fa-exclamation-triangle text-white"></i>
                    </div>
                  </div>
                  <div>
                    <span className="small text-gray-500">December 2, 2019</span>
                    <p>Spending Alert: We've noticed unusually high spending for your account.</p>
                  </div>
                </a>
                <a className="dropdown-item text-center small text-gray-500" href="#">
                  Show All Alerts
                </a>
              </div>
            </div>
          </li>
          <li className="nav-item mx-1 dropdown no-arrow">
            <div className="nav-item dropdown no-arrow">
              <a
                className="dropdown-toggle nav-link"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                href="#"
              >
                <span className="badge bg-danger badge-counter">7</span>
                <i className="fas fa-envelope fa-fw"></i>
              </a>
              <div className="dropdown-menu dropdown-menu-end dropdown-list animated--grow-in">
                <h6 className="dropdown-header">alerts center</h6>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <div className="me-3 dropdown-list-image">
                    <img className="rounded-circle" src="/assets/img/avatars/avatar4.jpeg" alt="" />
                    <div className="bg-success status-indicator"></div>
                  </div>
                  <div className="fw-bold">
                    <div className="text-truncate">
                      <span>Hi there! I am wondering if you can help me with a problem I've been having.</span>
                    </div>
                    <p className="mb-0 small text-gray-500">Emily Fowler - 58m</p>
                  </div>
                </a>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <div className="me-3 dropdown-list-image">
                    <img className="rounded-circle" src="/assets/img/avatars/avatar2.jpeg" alt="" />
                    <div className="status-indicator"></div>
                  </div>
                  <div className="fw-bold">
                    <div className="text-truncate">
                      <span>I have the photos that you ordered last month!</span>
                    </div>
                    <p className="mb-0 small text-gray-500">Jae Chun - 1d</p>
                  </div>
                </a>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <div className="me-3 dropdown-list-image">
                    <img className="rounded-circle" src="/assets/img/avatars/avatar3.jpeg" alt="" />
                    <div className="bg-warning status-indicator"></div>
                  </div>
                  <div className="fw-bold">
                    <div className="text-truncate">
                      <span>
                        Last month's report looks great, I am very happy with the progress so far,
                        keep up the good work!
                      </span>
                    </div>
                    <p className="mb-0 small text-gray-500">Morgan Alvarez - 2d</p>
                  </div>
                </a>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <div className="me-3 dropdown-list-image">
                    <img className="rounded-circle" src="/assets/img/avatars/avatar5.jpeg" alt="" />
                    <div className="bg-success status-indicator"></div>
                  </div>
                  <div className="fw-bold">
                    <div className="text-truncate">
                      <span>
                        Am I a good boy? The reason I ask is because someone told me that people say
                        this to all dogs, even if they aren't good...
                      </span>
                    </div>
                    <p className="mb-0 small text-gray-500">Chicken the Dog · 2w</p>
                  </div>
                </a>
                <a className="dropdown-item text-center small text-gray-500" href="#">
                  Show All Alerts
                </a>
              </div>
            </div>
          </li>
          <div className="d-none d-sm-block topbar-divider"></div>
          <li className="nav-item dropdown no-arrow">
            <div className="nav-item dropdown no-arrow">
              <a
                className="dropdown-toggle nav-link"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                href="#"
              >
                <span className="d-none d-lg-inline me-2 text-gray-600 small">Valerie Luna</span>
                <img
                  className="border rounded-circle img-profile"
                  src="/assets/img/avatars/avatar1.jpeg"
                  alt="user avatar"
                />
              </a>
              <div className="dropdown-menu shadow dropdown-menu-end animated--grow-in">
                <a className="dropdown-item" href="#">
                  <i className="fas fa-user me-2 fa-sm fa-fw text-gray-400"></i>&nbsp;Profile
                </a>
                <a className="dropdown-item" href="#">
                  <i className="fas fa-cogs me-2 fa-sm fa-fw text-gray-400"></i>&nbsp;Settings
                </a>
                <a className="dropdown-item" href="#">
                  <i className="fas fa-list me-2 fa-sm fa-fw text-gray-400"></i>&nbsp;Activity log
                </a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#">
                  <i className="fas fa-sign-out-alt me-2 fa-sm fa-fw text-gray-400"></i>&nbsp;Logout
                </a>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  )
}
