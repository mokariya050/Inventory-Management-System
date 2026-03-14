import { NavLink } from 'react-router-dom'
import { useSidebar } from '../context/SidebarContext'

export default function Sidebar() {
  const { toggled, toggleSidebar } = useSidebar()

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
          <div className="sidebar-brand-icon">
            <i className="fas fa-boxes"></i>
          </div>
          <div className="mx-3 sidebar-brand-text">
            <span>CoreInventory</span>
          </div>
        </a>

        <hr className="my-0 sidebar-divider" />

        <ul className="navbar-nav text-light w-100" id="accordionSidebar">

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

          <div className="sidebar-heading text-white-50 px-3 pt-3 pb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            SETTINGS
          </div>
          <li className="nav-item">
            <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/settings/warehouses">
              <i className="fas fa-warehouse"></i>
              <span>Warehouses</span>
            </NavLink>
          </li>

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
