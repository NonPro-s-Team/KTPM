import api from './axiosConfig';
import type { RepairRequestDto, CreateRepairRequest, UpdateRepairStatusRequest } from '../types/repair.types';

export const getRepairRequests = async (): Promise<RepairRequestDto[]> => {
  const response = await api.get<RepairRequestDto[]>('/repairrequests');
  return response.data;
};

export const createRepairRequest = async (data: CreateRepairRequest): Promise<RepairRequestDto> => {
  const response = await api.post<RepairRequestDto>('/repairrequests', data);
  return response.data;
};

export const updateRepairStatus = async (id: string, data: UpdateRepairStatusRequest): Promise<void> => {
  await api.patch(`/repairrequests/${id}/status`, data);
};
