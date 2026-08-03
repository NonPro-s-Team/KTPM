// "Property" ở đây là tên frontend cho khái niệm "Nhà trọ" — backend gọi là `Building`
// (route thật: /api/buildings). Field khớp 1:1 với BuildingListDto/BuildingDetailDto,
// xem backend/src/TroConnect.Api/Features/Buildings/BuildingDtos.cs.

export interface Property {
  id: string
  name: string
  address: string
  totalRooms: number
}

export interface PropertyDetail extends Property {
  createdAt: string
  updatedAt: string
  vacantRooms: number
  occupiedRooms: number
}

export interface CreatePropertyPayload {
  name: string
  address: string
  totalRooms: number
  confirmDuplicate?: boolean
}

export type UpdatePropertyPayload = Omit<CreatePropertyPayload, 'confirmDuplicate'>

// Khớp với { isDuplicate, existingBuilding, message } mà API trả về khi Create bị 409
export interface DuplicatePropertyInfo {
  id: string
  name: string
  address: string
}
