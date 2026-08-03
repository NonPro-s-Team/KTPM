import { isAxiosError } from 'axios'
import { api } from '../lib/axios'
import type {
  CreatePropertyPayload,
  DuplicatePropertyInfo,
  Property,
  PropertyDetail,
  UpdatePropertyPayload,
} from '../types/property'

// Gọi API thật /api/buildings — xem backend/src/TroConnect.Api/Features/Buildings/BuildingsController.cs

async function getAll(): Promise<Property[]> {
  const { data } = await api.get<Property[]>('/buildings')
  return data
}

async function getById(id: string): Promise<PropertyDetail> {
  const { data } = await api.get<PropertyDetail>(`/buildings/${id}`)
  return data
}

async function create(payload: CreatePropertyPayload): Promise<PropertyDetail> {
  const { data } = await api.post<PropertyDetail>('/buildings', payload)
  return data
}

async function update(
  id: string,
  payload: UpdatePropertyPayload,
): Promise<PropertyDetail> {
  const { data } = await api.put<PropertyDetail>(`/buildings/${id}`, payload)
  return data
}

async function remove(id: string): Promise<void> {
  await api.delete(`/buildings/${id}`)
}

// Create trả 409 { isDuplicate, existingBuilding, message } khi trùng địa chỉ —
// dùng hàm này để lấy thông tin nhà trọ trùng ra hỏi lại người dùng có muốn tạo tiếp không.
function getDuplicateInfo(err: unknown): DuplicatePropertyInfo | null {
  if (
    isAxiosError(err) &&
    err.response?.status === 409 &&
    err.response.data?.isDuplicate
  ) {
    const b = err.response.data.existingBuilding
    return { id: b.id, name: b.name, address: b.address }
  }
  return null
}

export const propertyService = {
  getAll,
  getById,
  create,
  update,
  remove,
  getDuplicateInfo,
}
