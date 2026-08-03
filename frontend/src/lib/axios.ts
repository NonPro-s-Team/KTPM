import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
})

// Login lưu token vào localStorage khi "Ghi nhớ đăng nhập", sessionStorage khi không — kiểm tra cả hai
function getToken(): string | null {
  return (
    localStorage.getItem('troconnect_token') ??
    sessionStorage.getItem('troconnect_token')
  )
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
