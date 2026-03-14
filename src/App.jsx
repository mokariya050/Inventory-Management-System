import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { SidebarProvider } from './context/SidebarContext'
import ProtectedRoute, { RoleRoute } from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'

import Dashboard   from './pages/Dashboard'
import Profile     from './pages/Profile'
import Products    from './pages/Products'
import MoveHistory from './pages/MoveHistory'
import Pending     from './pages/Pending'

import Receipts      from './pages/operations/Receipts'
import Deliveries    from './pages/operations/Deliveries'
import Transfers     from './pages/operations/Transfers'
import Adjustments   from './pages/operations/Adjustments'
import OperationForm from './pages/operations/OperationForm'

import Warehouses from './pages/settings/Warehouses'
import AdminUsers from './pages/admin/Users'

import Login           from './pages/Login'
import Register        from './pages/Register'
import RecoverPassword from './pages/RecoverPassword'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'Nunito', system-ui, sans-serif",
            fontSize: '0.875rem',
            fontWeight: 600,
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />
      <AuthProvider>
        <SidebarProvider>
          <Routes>

            {/* ── Authenticated routes ─────────────────────────────────── */}
            <Route element={<ProtectedRoute />}>

              {/* No-role landing page — full-page, no sidebar */}
              <Route path="/pending" element={<Pending />} />

              {/* Dashboard layout (sidebar + topbar) */}
              <Route element={<DashboardLayout />}>

                {/* Accessible to ALL authenticated users */}
                <Route path="/profile" element={<Profile />} />

                {/* ── Staff+ ─────────────────────────────────────────── */}
                <Route element={<RoleRoute minRole="staff" />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />

                  <Route path="/operations/receipts"        element={<Receipts />} />
                  <Route path="/operations/deliveries"      element={<Deliveries />} />
                  <Route path="/operations/transfers"       element={<Transfers />} />
                  <Route path="/operations/adjustments"     element={<Adjustments />} />

                  <Route path="/operations/receipts/new"    element={<OperationForm type="receipts"    />} />
                  <Route path="/operations/receipts/:id"    element={<OperationForm type="receipts"    />} />
                  <Route path="/operations/deliveries/new"  element={<OperationForm type="deliveries"  />} />
                  <Route path="/operations/deliveries/:id"  element={<OperationForm type="deliveries"  />} />
                  <Route path="/operations/transfers/new"   element={<OperationForm type="transfers"   />} />
                  <Route path="/operations/transfers/:id"   element={<OperationForm type="transfers"   />} />
                  <Route path="/operations/adjustments/new" element={<OperationForm type="adjustments" />} />
                  <Route path="/operations/adjustments/:id" element={<OperationForm type="adjustments" />} />

                  <Route path="/move-history" element={<MoveHistory />} />
                </Route>

                {/* ── Manager+ ───────────────────────────────────────── */}
                <Route element={<RoleRoute minRole="manager" />}>
                  <Route path="/settings/warehouses" element={<Warehouses />} />
                </Route>

                {/* ── Admin only ─────────────────────────────────────── */}
                <Route element={<RoleRoute minRole="admin" />}>
                  <Route path="/admin/users" element={<AdminUsers />} />
                </Route>

              </Route>
            </Route>

            {/* ── Public auth routes ───────────────────────────────────── */}
            <Route element={<AuthLayout />}>
              <Route path="/login"            element={<Login />} />
              <Route path="/register"         element={<Register />} />
              <Route path="/recover-password" element={<RecoverPassword />} />
            </Route>

          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
