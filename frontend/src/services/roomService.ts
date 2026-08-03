import type { CreateRoomPayload, Room, UpdateRoomPayload } from '../types/room'

// TODO: MOCK — chưa có Rooms API thật ở backend. Dữ liệu lưu tạm trong localStorage
// để CRUD hoạt động qua reload trang, thay toàn bộ file này bằng axios calls tới
// /api/properties/{propertyId}/rooms (hoặc route tương đương) khi backend có Rooms feature.

const STORAGE_KEY = 'troconnect_mock_rooms'

function readAll(): Room[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Room[]
  } catch {
    return []
  }
}

function writeAll(rooms: Room[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms))
}

function simulateLatency<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 250))
}

async function getByPropertyId(propertyId: string): Promise<Room[]> {
  const rooms = readAll().filter((r) => r.propertyId === propertyId)
  return simulateLatency(rooms)
}

async function create(
  propertyId: string,
  payload: CreateRoomPayload,
): Promise<Room> {
  const rooms = readAll()
  const room: Room = { id: crypto.randomUUID(), propertyId, ...payload }
  rooms.push(room)
  writeAll(rooms)
  return simulateLatency(room)
}

async function update(id: string, payload: UpdateRoomPayload): Promise<Room> {
  const rooms = readAll()
  const index = rooms.findIndex((r) => r.id === id)
  if (index === -1) throw new Error('Room not found')
  rooms[index] = { ...rooms[index], ...payload }
  writeAll(rooms)
  return simulateLatency(rooms[index])
}

async function remove(id: string): Promise<void> {
  writeAll(readAll().filter((r) => r.id !== id))
  return simulateLatency(undefined)
}

export const roomService = { getByPropertyId, create, update, remove }
