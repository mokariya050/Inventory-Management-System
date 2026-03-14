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
      aria-label="Main navigation"
      className={`sidebar${toggled ? ' toggled' : ''}`}
    >
      <div className="d-flex flex-column h-100">
        {/* Brand */}
        <a
          className="navbar-brand d-flex justify-content-center align-items-center m-0 sidebar-brand"
          href="/"
          aria-label="CoreInventory home"
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
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/" end title="Dashboard">
                  <i className="fas fa-tachometer-alt"></i>
                  <span>Dashboard</span>
                </NavLink>
              </li>

              <div className="sidebar-heading">INVENTORY</div>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/products" title="Products">
                  <i className="fas fa-box"></i>
                  <span>Products</span>
                </NavLink>
              </li>

              <div className="sidebar-heading">OPERATIONS</div>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/operations/receipts" title="Receipts">
                  <i className="fas fa-truck-loading"></i>
                  <span>Receipts</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/operations/deliveries" title="Deliveries">
                  <i className="fas fa-truck"></i>
                  <span>Deliveries</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/operations/transfers" title="Transfers">
                  <i className="fas fa-exchange-alt"></i>
                  <span>Transfers</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/operations/adjustments" title="Adjustments">
                  <i className="fas fa-sliders-h"></i>
                  <span>Adjustments</span>
                </NavLink>
              </li>

              <div className="sidebar-heading">HISTORY</div>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/move-history" title="Move History">
                  <i className="fas fa-history"></i>
                  <span>Move History</span>
                </NavLink>
              </li>
            </>
          )}

          {/* ── Manager+ ──────────────────────────────────────────────── */}
          {isManager && (
            <>
              <div className="sidebar-heading">SETTINGS</div>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/settings/warehouses" title="Warehouses">
                  <i className="fas fa-warehouse"></i>
                  <span>Warehouses</span>
                </NavLink>
              </li>
            </>
          )}

          {/* ── Admin only ────────────────────────────────────────────── */}
          {isAdmin && (
            <>
              <div className="sidebar-heading">ADMINISTRATION</div>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/admin/users" title="User Management">
                  <i className="fas fa-users-cog"></i>
                  <span>User Management</span>
                </NavLink>
              </li>
            </>
          )}

          {/* ── Always visible ────────────────────────────────────────── */}
          <div className="sidebar-heading">ACCOUNT</div>
          <li className="nav-item">
            <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/profile" title="My Profile">
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
            aria-label={toggled ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!toggled}
            aria-controls="accordionSidebar"
          />
        </div>
      </div>
    </nav>
  )
}
