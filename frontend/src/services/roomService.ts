import type { Room } from "../types/models";
import { apiClient } from "./apiClient";

export const roomService = {
  list: () => apiClient.get<Room[]>("/rooms"),
  getById: (id: string) => apiClient.get<Room>(`/rooms/${id}`),
  create: (room: Omit<Room, "id">) =>
    apiClient.post<Room, Omit<Room, "id">>("/rooms", room),
};
