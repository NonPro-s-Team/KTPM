import { isAxiosError } from 'axios'
import { api } from '../lib/axios'
import type { Tenant, TenantDetail, TenantPayload } from '../types/tenant'

// Gọi API thật /api/tenants — xem backend/src/TroConnect.Api/Features/Tenants/TenantsController.cs.
// KHÔNG có getByRoomId: BE chưa có liên kết Tenant <-> Room (xem ghi chú ở types/tenant.ts).

async function getAll(search?: string): Promise<Tenant[]> {
  const { data } = await api.get<Tenant[]>('/tenants', {
    params: search?.trim() ? { search: search.trim() } : undefined,
  })
  return data
}

async function getById(id: string): Promise<TenantDetail> {
  const { data } = await api.get<TenantDetail>(`/tenants/${id}`)
  return data
}

async function create(payload: TenantPayload): Promise<TenantDetail> {
  const { data } = await api.post<TenantDetail>('/tenants', payload)
  return data
}

async function update(id: string, payload: TenantPayload): Promise<TenantDetail> {
  const { data } = await api.put<TenantDetail>(`/tenants/${id}`, payload)
  return data
}

async function remove(id: string): Promise<void> {
  await api.delete(`/tenants/${id}`)
}

// 400 model-validation trả ValidationProblemDetails chuẩn ASP.NET:
// { errors: { "FullName": ["..."], "Email": ["..."] } } — key PascalCase đúng tên field C#,
// đã verify qua API thật (giống module Room).
const FIELD_KEY_MAP: Record<string, keyof TenantPayload> = {
  FullName: 'fullName',
  IdNumber: 'idNumber',
  PhoneNumber: 'phoneNumber',
  Hometown: 'hometown',
  DateOfBirth: 'dateOfBirth',
  Gender: 'gender',
  Email: 'email',
}

function getFieldErrors(
  err: unknown,
): Partial<Record<keyof TenantPayload, string>> | null {
  if (!isAxiosError(err) || err.response?.status !== 400) return null
  const errors = err.response.data?.errors as Record<string, string[]> | undefined
  if (!errors) return null

  const mapped: Partial<Record<keyof TenantPayload, string>> = {}
  for (const [key, messages] of Object.entries(errors)) {
    const field = FIELD_KEY_MAP[key]
    if (field && messages[0]) mapped[field] = messages[0]
  }
  return Object.keys(mapped).length > 0 ? mapped : null
}

// BE trả message business-rule bằng TIẾNG ANH — dịch trước khi hiển thị, tránh lòi chuỗi
// tiếng Anh ra UI (cùng cách xử lý đã áp dụng ở roomService).
function translateErrorMessage(message: string): string {
  if (message.includes('ID number already exists')) {
    return 'Số CCCD/CMND này đã được dùng cho một hồ sơ người thuê khác.'
  }
  if (message.includes('Tenant not found')) return 'Không tìm thấy hồ sơ người thuê.'
  return message
}

// DuplicateIdNumber (400) và NotFound (404) đều trả { message } phẳng, không nằm trong "errors".
// Lỗi trùng CCCD gắn được vào đúng field idNumber nên page/modal ưu tiên hiển thị inline ở đó.
function getErrorMessage(err: unknown): string | null {
  if (!isAxiosError(err)) return null
  const message = err.response?.data?.message as string | undefined
  return message ? translateErrorMessage(message) : null
}

function isDuplicateIdNumberError(err: unknown): boolean {
  return (
    isAxiosError(err) &&
    err.response?.status === 400 &&
    typeof err.response.data?.message === 'string' &&
    err.response.data.message.includes('ID number already exists')
  )
}

export const tenantService = {
  getAll,
  getById,
  create,
  update,
  remove,
  getFieldErrors,
  getErrorMessage,
  isDuplicateIdNumberError,
}
