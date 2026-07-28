export const RoomStatus = {
  Available: 'Available',
  Occupied: 'Occupied',
  Maintenance: 'Maintenance',
  Inactive: 'Inactive',
} as const;

export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];

export interface RoomDto {
  id: string;
  roomNumber: string;
  monthlyRent: number;
  status: RoomStatus;
  description?: string;
  createdAt: string;
}

export interface CreateRoomRequest {
  roomNumber: string;
  monthlyRent: number;
  description?: string;
}

export interface UpdateRoomRequest {
  roomNumber: string;
  monthlyRent: number;
  description?: string;
}

export interface ChangeRoomStatusRequest {
  status: RoomStatus;
}
