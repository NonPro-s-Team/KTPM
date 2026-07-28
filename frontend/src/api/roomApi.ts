import api from './axiosConfig';
import type { RoomDto, CreateRoomRequest, UpdateRoomRequest, ChangeRoomStatusRequest } from '../types/room.types';

export const getRooms = async (): Promise<RoomDto[]> => {
  const response = await api.get<RoomDto[]>('/rooms');
  return response.data;
};

export const getRoomById = async (id: string): Promise<RoomDto> => {
  const response = await api.get<RoomDto>(`/rooms/${id}`);
  return response.data;
};

export const createRoom = async (data: CreateRoomRequest): Promise<RoomDto> => {
  const response = await api.post<RoomDto>('/rooms', data);
  return response.data;
};

export const updateRoom = async (id: string, data: UpdateRoomRequest): Promise<RoomDto> => {
  const response = await api.put<RoomDto>(`/rooms/${id}`, data);
  return response.data;
};

export const changeRoomStatus = async (id: string, data: ChangeRoomStatusRequest): Promise<void> => {
  await api.patch(`/rooms/${id}/status`, data);
};
