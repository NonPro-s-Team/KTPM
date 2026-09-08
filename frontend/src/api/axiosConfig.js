import axios from 'axios'

let isRefreshing = false
let queue = []

const BASE_URL = import.meta.env.VITE_API_URL
const COLD_START_RETRY_DELAY_MS = 12000  // Railway cold start thường mất 10-15s

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const isNetworkError = (error) =>
  !error.response && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || !error.code)

const isSafeToRetry = (config) =>
  ['get', 'head', 'options'].includes(config?.method?.toLowerCase())

// ── Request interceptor ────────────────────────────────────────────
api.interceptors.request.use((config) => {
  if (config.skipAccessToken) {
    return config
  }

  const token = localStorage.getItem('accessToken')
  const hasAuthHeader =
    !!config.headers?.Authorization || !!config.headers?.authorization

  if (token && !hasAuthHeader) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
  }
  return config
})

const isAuthRequest = (config) => {
  const requestUrl = config?.url || ''
  return requestUrl.startsWith('/auth/') || requestUrl.includes('/api/auth/')
}

const withAccessToken = (config, token) => {
  config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
  return api(config)
}

const waitForRefresh = (original) => new Promise((resolve, reject) => {
  queue.push({ resolve, reject })
}).then((token) => withAccessToken(original, token))

const resolveRefreshQueue = (token) => {
  queue.forEach((pending) => pending.resolve(token))
  queue = []
}

const rejectRefreshQueue = (error) => {
  queue.forEach((pending) => pending.reject(error))
  queue = []
}

const parseRefreshResponse = (response) => {
  const accessToken = response?.data?.accessToken
  const refreshToken = response?.data?.refreshToken
  if (typeof accessToken !== 'string' || !accessToken
      || typeof refreshToken !== 'string' || !refreshToken) {
    const invalidResponse = new Error('Invalid refresh response')
    invalidResponse.invalidAuthResponse = true
    throw invalidResponse
  }
  return { accessToken, refreshToken }
}

const persistRefreshedSession = async (response) => {
  const { accessToken, refreshToken } = parseRefreshResponse(response)
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)

  const { default: useAuthStore } = await import('../store/authStore')
  useAuthStore.setState({ accessToken, refreshToken, isLoggedIn: true })
  return accessToken
}

const refreshAndRetry = async (original, refreshToken) => {
  try {
    const response = await api.post('/auth/refresh', null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
      skipAccessToken: true,
      timeout: 15000,
    })
    const accessToken = await persistRefreshedSession(response)
    resolveRefreshQueue(accessToken)
    return withAccessToken(original, accessToken)
  } catch (refreshError) {
    rejectRefreshQueue(refreshError)
    const status = refreshError.response?.status
    if (refreshError.invalidAuthResponse || status === 401 || status === 403) {
      forceLogout()
    } else {
      // Preserve credentials on an outage; a later request may retry refresh.
      original._retry = false
    }
    throw refreshError
  } finally {
    isRefreshing = false
  }
}

// ── Response interceptor ───────────────────────────────────────────
const handleResponseError = async (error) => {
  const original = error.config

  // Retry only idempotent reads after a likely Railway cold start.
  if (original && isSafeToRetry(original) && isNetworkError(error) && !original._coldRetry) {
    original._coldRetry = true
    await sleep(COLD_START_RETRY_DELAY_MS)
    return api(original)
  }

  if (isAuthRequest(original)) throw error
  if (error.response?.status !== 401 || !original || original._retry) {
    throw error
  }

  original._retry = true
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    forceLogout()
    throw error
  }
  if (isRefreshing) return waitForRefresh(original)

  isRefreshing = true
  return refreshAndRetry(original, refreshToken)
}

api.interceptors.response.use((response) => response, handleResponseError)

async function forceLogout() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('role')

  try {
    const { default: useCartStore } = await import('../store/useCartStore')
    useCartStore.getState().resetCart()
  } catch {
    // Cart state is optional during early application bootstrap.
  }

  window.location.href = '/login'
}

export default api
