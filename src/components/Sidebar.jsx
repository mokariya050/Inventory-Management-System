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
        <a
          className="navbar-brand d-flex justify-content-center align-items-center m-0 sidebar-brand"
          href="#"
        >
          <div className="sidebar-brand-icon rotate-n-15">
            <i className="fas fa-laugh-wink"></i>
          </div>
          <div className="mx-3 sidebar-brand-text">
            <span>Brand</span>
          </div>
        </a>
        <hr className="my-0 sidebar-divider" />
        <ul className="navbar-nav text-light" id="accordionSidebar">
          <li className="nav-item">
            <NavLink
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              to="/"
              end
            >
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              to="/profile"
            >
              <i className="fas fa-user"></i>
              <span>Profile</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              to="/table"
            >
              <i className="fas fa-table"></i>
              <span>Table</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              to="/login"
            >
              <i className="far fa-user-circle"></i>
              <span>Login</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              to="/register"
            >
              <i className="fas fa-user-circle"></i>
              <span>Register</span>
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
