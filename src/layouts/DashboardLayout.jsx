import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Footer from '../components/Footer'
import ScrollToTop from '../components/ScrollToTop'

export default function DashboardLayout() {
  return (
    <div id="wrapper">
      <Sidebar />
      <div className="d-flex flex-column" id="content-wrapper">
        <div id="content">
          <Topbar />
          <div className="container-fluid">
            <Outlet />
          </div>
        </div>
        <Footer />
      </div>
      <ScrollToTop />
    </div>
  )
}
