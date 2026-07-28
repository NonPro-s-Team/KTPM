import api from './axiosConfig';
import type { ContractDto, CreateContractRequest } from '../types/contract.types';

export const getContracts = async (): Promise<ContractDto[]> => {
  const response = await api.get<ContractDto[]>('/contracts');
  return response.data;
};

export const getContractById = async (id: string): Promise<ContractDto> => {
  const response = await api.get<ContractDto>(`/contracts/${id}`);
  return response.data;
};

export const createContract = async (data: CreateContractRequest): Promise<ContractDto> => {
  const response = await api.post<ContractDto>('/contracts', data);
  return response.data;
};
