import { isAxiosError } from 'axios'
import { api } from '../lib/axios'
import type { Room, RoomDetail, RoomPayload } from '../types/room'

// Gọi API thật /api/rooms — xem backend/src/TroConnect.Api/Features/Rooms/RoomsController.cs.
// Route flat (không nested theo building), lọc theo nhà trọ bằng query param buildingId.

async function getByBuildingId(buildingId: string): Promise<Room[]> {
  const { data } = await api.get<Room[]>('/rooms', { params: { buildingId } })
  return data
}

async function getById(id: string): Promise<RoomDetail> {
  const { data } = await api.get<RoomDetail>(`/rooms/${id}`)
  return data
}

async function create(payload: RoomPayload): Promise<RoomDetail> {
  const { data } = await api.post<RoomDetail>('/rooms', payload)
  return data
}

async function update(id: string, payload: RoomPayload): Promise<RoomDetail> {
  const { data } = await api.put<RoomDetail>(`/rooms/${id}`, payload)
  return data
}

async function remove(id: string): Promise<void> {
  await api.delete(`/rooms/${id}`)
}

// 400 model-validation (thiếu Name, giá âm...) trả ValidationProblemDetails chuẩn ASP.NET:
// { errors: { "Name": ["..."], "BasePrice": ["..."] } } — key PascalCase đúng tên field C#,
// đã verify trực tiếp qua API thật, KHÔNG phải camelCase như các response khác.
const FIELD_KEY_MAP: Record<string, keyof RoomPayload> = {
  Name: 'name',
  BasePrice: 'basePrice',
  ServicePrice: 'servicePrice',
  MaxOccupancy: 'maxOccupancy',
  SingleOccupantDiscountAmount: 'singleOccupantDiscountAmount',
  BuildingId: 'buildingId',
}

function getFieldErrors(err: unknown): Partial<Record<keyof RoomPayload, string>> | null {
  if (!isAxiosError(err) || err.response?.status !== 400) return null
  const errors = err.response.data?.errors as Record<string, string[]> | undefined
  if (!errors) return null

  const mapped: Partial<Record<keyof RoomPayload, string>> = {}
  for (const [key, messages] of Object.entries(errors)) {
    const field = FIELD_KEY_MAP[key]
    if (field && messages[0]) mapped[field] = messages[0]
  }
  return Object.keys(mapped).length > 0 ? mapped : null
}

// RoomLimitReached (400) và BuildingNotFound/RoomNotFound (404) đều trả { message } phẳng,
// không nằm trong "errors" — dùng cho các lỗi không gắn được vào field cụ thể nào.
function getErrorMessage(err: unknown): string | null {
  if (!isAxiosError(err)) return null
  const message = err.response?.data?.message as string | undefined
  return message ?? null
}

export const roomService = {
  getByBuildingId,
  getById,
  create,
  update,
  remove,
  getFieldErrors,
  getErrorMessage,
}
