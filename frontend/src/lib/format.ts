const numberFormatter = new Intl.NumberFormat('vi-VN')

export const EMPTY_VALUE = '—'

export function formatCurrency(value: number): string {
  return `${numberFormatter.format(value)} đ`
}

// Dùng cho field DateOnly của BE (chuỗi "yyyy-MM-dd"). Tự tách chuỗi thay vì new Date()
// để không bị lệch ngày do trình duyệt hiểu chuỗi đó là UTC rồi đổi sang giờ địa phương.
export function formatDateOnly(value: string | null | undefined): string {
  if (!value) return EMPTY_VALUE
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

// Dùng cho field DateTimeOffset của BE (chuỗi ISO có offset) — đổi sang giờ địa phương là đúng.
// Tự ghép "dd/MM/yyyy HH:mm" thay vì toLocaleString('vi-VN') vì locale đó trả giờ đứng TRƯỚC
// ngày ("19:22 04/08/2026"), đọc ngược với cách viết thông thường.
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return EMPTY_VALUE
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
