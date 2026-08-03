export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export const passwordChecks = (password: string) => ({
  minLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasNumber: /\d/.test(password),
})

// 0–4: mỗi tiêu chí +1 (>=8 ký tự, chữ hoa, số, ký tự đặc biệt hoặc >=12 ký tự)
export function scorePassword(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score++
  return score
}
