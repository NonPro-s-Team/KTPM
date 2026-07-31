import type {
  ChangeRoomStatusRequest,
  CreateRoomRequest,
  PagedQuery,
  PagedResult,
  RoomResponse,
  RoomStatus,
  UpdateRoomRequest,
} from "../types/api";
import { httpClient } from "./httpClient";

export const roomsApi = {
  async list(query: PagedQuery<RoomStatus>, signal?: AbortSignal) {
    const response = await httpClient.get<PagedResult<RoomResponse>>("/rooms", {
      params: query,
      signal,
    });
    return response.data;
  },
  async getById(id: string, signal?: AbortSignal) {
    const response = await httpClient.get<RoomResponse>(`/rooms/${id}`, {
      signal,
    });
    return response.data;
  },
  async create(request: CreateRoomRequest) {
    const response = await httpClient.post<RoomResponse>("/rooms", request);
    return response.data;
  },
  async update(id: string, request: UpdateRoomRequest) {
    const response = await httpClient.put<RoomResponse>(`/rooms/${id}`, request);
    return response.data;
  },
  async changeStatus(id: string, request: ChangeRoomStatusRequest) {
    const response = await httpClient.patch<RoomResponse>(
      `/rooms/${id}/status`,
      request,
    );
    return response.data;
  },
};
