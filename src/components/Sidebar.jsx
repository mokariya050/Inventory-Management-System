import { NavLink } from 'react-router-dom'
import { useSidebar } from '../context/SidebarContext'
import { useAuth } from '../context/AuthContext'

const ROLE_LEVELS = { admin: 3, manager: 2, staff: 1 }

export default function Sidebar() {
  const { toggled, toggleSidebar } = useSidebar()
  const { user } = useAuth()

  const level     = ROLE_LEVELS[user?.role] || 0
  const isStaff   = level >= ROLE_LEVELS.staff
  const isManager = level >= ROLE_LEVELS.manager
  const isAdmin   = level >= ROLE_LEVELS.admin

  return (
    <nav
      className={`navbar align-items-start p-0 sidebar sidebar-dark accordion bg-gradient-primary navbar-dark${toggled ? ' toggled' : ''}`}
      style={{ background: '#575D90' }}
    >
      <div className="container-fluid d-flex flex-column p-0">
        {/* Brand */}
        <a
          className="navbar-brand d-flex justify-content-center align-items-center m-0 sidebar-brand"
          href="#"
        >
          <div className="sidebar-brand-icon" style={{ lineHeight: 0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="15" width="20" height="5" rx="2" fill="white"/>
              <rect x="5" y="9.5" width="14" height="5" rx="2" fill="white" fillOpacity="0.72"/>
              <rect x="8" y="4" width="8" height="5" rx="2" fill="white" fillOpacity="0.44"/>
            </svg>
          </div>
          <div className="mx-3 sidebar-brand-text" style={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
            <span>CoreInventory</span>
          </div>
        </a>

        <hr className="my-0 sidebar-divider" />

        <ul className="navbar-nav text-light w-100" id="accordionSidebar">

          {/* ── Staff+ ────────────────────────────────────────────────── */}
          {isStaff && (
            <>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/" end>
                  <i className="fas fa-tachometer-alt"></i>
                  <span>Dashboard</span>
                </NavLink>
              </li>

              <div className="sidebar-heading text-white-50 px-3 pt-3 pb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                INVENTORY
              </div>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/products">
                  <i className="fas fa-box"></i>
                  <span>Products</span>
                </NavLink>
              </li>

              <div className="sidebar-heading text-white-50 px-3 pt-3 pb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                OPERATIONS
              </div>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/operations/receipts">
                  <i className="fas fa-truck-loading"></i>
                  <span>Receipts</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/operations/deliveries">
                  <i className="fas fa-truck"></i>
                  <span>Deliveries</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/operations/transfers">
                  <i className="fas fa-exchange-alt"></i>
                  <span>Transfers</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/operations/adjustments">
                  <i className="fas fa-sliders-h"></i>
                  <span>Adjustments</span>
                </NavLink>
              </li>

              <div className="sidebar-heading text-white-50 px-3 pt-3 pb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                HISTORY
              </div>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/move-history">
                  <i className="fas fa-history"></i>
                  <span>Move History</span>
                </NavLink>
              </li>
            </>
          )}

          {/* ── Manager+ ──────────────────────────────────────────────── */}
          {isManager && (
            <>
              <div className="sidebar-heading text-white-50 px-3 pt-3 pb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                SETTINGS
              </div>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/settings/warehouses">
                  <i className="fas fa-warehouse"></i>
                  <span>Warehouses</span>
                </NavLink>
              </li>
            </>
          )}

          {/* ── Admin only ────────────────────────────────────────────── */}
          {isAdmin && (
            <>
              <div className="sidebar-heading text-white-50 px-3 pt-3 pb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                ADMINISTRATION
              </div>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/admin/users">
                  <i className="fas fa-users-cog"></i>
                  <span>User Management</span>
                </NavLink>
              </li>
            </>
          )}

          {/* ── Always visible ────────────────────────────────────────── */}
          <div className="sidebar-heading text-white-50 px-3 pt-3 pb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            ACCOUNT
          </div>
          <li className="nav-item">
            <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/profile">
              <i className="fas fa-user"></i>
              <span>My Profile</span>
            </NavLink>
          </li>

        </ul>

        <div className="text-center d-none d-md-inline">
          <button
            className="btn rounded-circle border-0"
            id="sidebarToggle"
            onClick={toggleSidebar}
            type="button"
          />
        </div>
      </div>
    </nav>
  )
}
