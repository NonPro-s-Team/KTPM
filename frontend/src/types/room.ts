// TODO: Backend chưa có module Room (chỉ có Building — xem BuildingService.cs dòng
// "once the Room module exists"). Type + service này đang chạy trên mock data cục bộ
// theo docs/room-management.md, thay bằng gọi API thật khi backend có Rooms feature.

export interface Room {
  id: string
  propertyId: string
  name: string
  basePrice: number
  servicePrice: number
  maxOccupancy: number
  singleOccupantDiscount: number | null
}

export interface CreateRoomPayload {
  name: string
  basePrice: number
  servicePrice: number
  maxOccupancy: number
  singleOccupantDiscount: number | null
}

export type UpdateRoomPayload = CreateRoomPayload
