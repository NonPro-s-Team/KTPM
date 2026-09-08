import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, isAuthReady, user } = useAuthStore()

  if (!isAuthReady) return null
  if (!isLoggedIn || !user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // CUSTOMER vào admin → về trang chủ
    // ADMIN/STAFF vào customer page → về admin
    return user.role === 'CUSTOMER'
      ? <Navigate to="/" replace />
      : <Navigate to="/login" replace />
  }

  return children
}

export function GuestRoute({ children }) {
  const { isLoggedIn, isAuthReady, user } = useAuthStore()

  if (!isAuthReady) return null
  if (!isLoggedIn || !user) return children

  // Đã login → redirect theo role
  if (user.role === 'CUSTOMER') return <Navigate to="/" replace />
  if (user.role === 'ADMIN' || user.role === 'STAFF') return <Navigate to="/admin" replace />
  return children
}
