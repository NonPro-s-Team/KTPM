import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
})

const TOKEN_KEY = 'troconnect_token'

// Login lưu token vào localStorage khi "Ghi nhớ đăng nhập", sessionStorage khi không — kiểm tra cả hai
function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Chỉ tự động điều hướng khi request ĐÃ gắn Bearer token mà vẫn bị 401 (token hết hạn/không
    // hợp lệ) — không áp dụng cho 401 do sai email/mật khẩu ở /accounts/login (request đó không
    // gắn token, LoginPage tự xử lý lỗi đó inline).
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      localStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
