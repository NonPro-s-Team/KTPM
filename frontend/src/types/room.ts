// Khớp 100% với backend/src/TroConnect.Api/Features/Rooms/RoomDtos.cs — đã verify trực tiếp
// qua API thật (không đoán field). Route thật: /api/rooms (flat, KHÔNG nested theo building),
// lọc theo nhà trọ bằng query param ?buildingId=. Không có pagination, không có response wrapper
// — mảng/object trả thẳng.
//
// TODO đã báo lại người dùng: BE hiện KHÔNG có trường trạng thái phòng (Available/Occupied/
// Maintenance), KHÔNG có tầng, KHÔNG có diện tích — dù yêu cầu ban đầu có nhắc tới. Không tự
// thêm các field này ở đây cho tới khi BE thực sự có.

// RoomListDto — GET /rooms, GET /rooms?buildingId=X. Chỉ có 4 field, KHÔNG có servicePrice /
// singleOccupantDiscountAmount (khác với bản mock cũ) — muốn xem đủ field phải gọi getById.
export interface Room {
  id: string
  name: string
  buildingName: string
  basePrice: number
  maxOccupancy: number
}

// RoomDetailDto — GET /rooms/{id}, và cũng là response của POST/PUT /rooms
export interface RoomDetail {
  id: string
  buildingId: string
  buildingName: string
  name: string
  basePrice: number
  servicePrice: number
  maxOccupancy: number
  singleOccupantDiscountAmount: number | null
  createdAt: string
  updatedAt: string
}

// CreateRoomRequest / UpdateRoomRequest — hai request có cùng shape ở BE
export interface RoomPayload {
  buildingId: string
  name: string
  basePrice: number
  servicePrice: number
  maxOccupancy: number
  singleOccupantDiscountAmount: number | null
}
