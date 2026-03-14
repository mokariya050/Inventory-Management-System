import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SidebarProvider } from './context/SidebarContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'

import Dashboard    from './pages/Dashboard'
import Profile      from './pages/Profile'
import Products     from './pages/Products'
import MoveHistory  from './pages/MoveHistory'

import Receipts    from './pages/operations/Receipts'
import Deliveries  from './pages/operations/Deliveries'
import Transfers   from './pages/operations/Transfers'
import Adjustments from './pages/operations/Adjustments'
import OperationForm from './pages/operations/OperationForm'

import Warehouses from './pages/settings/Warehouses'

import Login          from './pages/Login'
import Register       from './pages/Register'
import RecoverPassword from './pages/RecoverPassword'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />

                {/* Inventory */}
                <Route path="/products" element={<Products />} />

                {/* Operations – lists */}
                <Route path="/operations/receipts"    element={<Receipts />} />
                <Route path="/operations/deliveries"  element={<Deliveries />} />
                <Route path="/operations/transfers"   element={<Transfers />} />
                <Route path="/operations/adjustments" element={<Adjustments />} />

                {/* Operations – forms (new & edit) */}
                <Route path="/operations/receipts/new"     element={<OperationForm type="receipts" />} />
                <Route path="/operations/receipts/:id"     element={<OperationForm type="receipts" />} />
                <Route path="/operations/deliveries/new"   element={<OperationForm type="deliveries" />} />
                <Route path="/operations/deliveries/:id"   element={<OperationForm type="deliveries" />} />
                <Route path="/operations/transfers/new"    element={<OperationForm type="transfers" />} />
                <Route path="/operations/transfers/:id"    element={<OperationForm type="transfers" />} />
                <Route path="/operations/adjustments/new"  element={<OperationForm type="adjustments" />} />
                <Route path="/operations/adjustments/:id"  element={<OperationForm type="adjustments" />} />

                {/* History */}
                <Route path="/move-history" element={<MoveHistory />} />

                {/* Settings */}
                <Route path="/settings/warehouses" element={<Warehouses />} />
              </Route>
            </Route>
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
