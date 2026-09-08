import { create } from 'zustand'
import authApi from '../api/authApi'
import userApi from '../api/userApi'
import useCartStore from './useCartStore'

const isNetworkError = (err) =>
  !err.response &&
  (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || !err.code)

const VALID_ROLES = new Set(['CUSTOMER', 'STAFF', 'ADMIN'])
const storedAccessToken = localStorage.getItem('accessToken')
const storedRefreshToken = localStorage.getItem('refreshToken')
const hasStoredSession = !!storedAccessToken && !!storedRefreshToken

const clearStoredAuth = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('role')
}

const isValidAuthPayload = (accessToken, refreshToken, role) =>
  typeof accessToken === 'string' && !!accessToken
  && typeof refreshToken === 'string' && !!refreshToken
  && VALID_ROLES.has(role)

const isValidUser = (user) =>
  !!user && typeof user === 'object' && VALID_ROLES.has(user.role)

const useAuthStore = create((set) => ({
  user: null,
  accessToken: hasStoredSession ? storedAccessToken : null,
  refreshToken: hasStoredSession ? storedRefreshToken : null,
  isLoggedIn: hasStoredSession,
  isAuthReady: !hasStoredSession,

  setAuth: async (accessToken, refreshToken, role) => {
    if (!isValidAuthPayload(accessToken, refreshToken, role)) {
      clearStoredAuth()
      set({ accessToken: null, refreshToken: null, user: null, isLoggedIn: false, isAuthReady: true })
      throw new Error('Phản hồi đăng nhập không hợp lệ')
    }

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.removeItem('role')
    set({ accessToken, refreshToken, user: { role }, isLoggedIn: true, isAuthReady: false })

    try {
      const res = await userApi.getMe()
      if (isValidUser(res.data)) {
        set({ user: res.data, isAuthReady: true })
      } else {
        set({ isAuthReady: true })
      }
    } catch (err) {
      // The signed auth response is still usable when profile hydration is offline.
      if (isNetworkError(err)) {
        set({ isAuthReady: true })
        return
      }
      clearStoredAuth()
      set({ accessToken: null, refreshToken: null, user: null, isLoggedIn: false, isAuthReady: true })
      throw err
    }
  },

  setUser: (user) => set({ user }),

  fetchMe: async () => {
    try {
      const res = await userApi.getMe()
      if (!isValidUser(res.data)) {
        throw new Error('Phản hồi hồ sơ không hợp lệ')
      }
      set({ user: res.data, isLoggedIn: true, isAuthReady: true })
    } catch (err) {
      const status = err.response?.status

      // Network error hoặc cold start → server chưa boot xong, giữ nguyên state
      if (isNetworkError(err)) {
        set({ isAuthReady: true })
        return
      }

      // Còn refreshToken → axiosConfig đang tự xử lý refresh, không cần logout
      if (status === 401 || status === 403) {
        clearStoredAuth()
        set({ accessToken: null, refreshToken: null, user: null, isLoggedIn: false, isAuthReady: true })
        return
      }

      clearStoredAuth()
      set({ accessToken: null, refreshToken: null, user: null, isLoggedIn: false, isAuthReady: true })
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    let revoked = false
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken)
        revoked = true
      }
    } catch {
      // Local credentials are still cleared; callers may use the return value to warn.
    } finally {
      clearStoredAuth()
      set({ accessToken: null, refreshToken: null, user: null, isLoggedIn: false, isAuthReady: true })
      useCartStore.getState().resetCart()
    }
    return revoked
  },
}))

export default useAuthStore
