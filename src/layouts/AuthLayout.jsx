import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="bg-secondary min-vh-100 d-flex align-items-center">
      <Outlet />
    </div>
  )
}
