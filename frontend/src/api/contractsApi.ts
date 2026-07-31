import type {
  ContractStatus,
  CreateRentalContractRequest,
  PagedQuery,
  PagedResult,
  RentalContractResponse,
  UpdateDraftContractRequest,
} from "../types/api";
import { httpClient } from "./httpClient";

export const contractsApi = {
  async list(query: PagedQuery<ContractStatus>, signal?: AbortSignal) {
    const response = await httpClient.get<PagedResult<RentalContractResponse>>(
      "/contracts",
      { params: query, signal },
    );
    return response.data;
  },
  async getById(id: string, signal?: AbortSignal) {
    const response = await httpClient.get<RentalContractResponse>(
      `/contracts/${id}`,
      { signal },
    );
    return response.data;
  },
  async create(request: CreateRentalContractRequest) {
    const response = await httpClient.post<RentalContractResponse>(
      "/contracts",
      request,
    );
    return response.data;
  },
  async update(id: string, request: UpdateDraftContractRequest) {
    const response = await httpClient.put<RentalContractResponse>(
      `/contracts/${id}`,
      request,
    );
    return response.data;
  },
  async activate(id: string) {
    const response = await httpClient.post<RentalContractResponse>(
      `/contracts/${id}/activate`,
    );
    return response.data;
  },
  async terminate(id: string) {
    const response = await httpClient.post<RentalContractResponse>(
      `/contracts/${id}/terminate`,
    );
    return response.data;
  },
  async cancel(id: string) {
    const response = await httpClient.post<RentalContractResponse>(
      `/contracts/${id}/cancel`,
    );
    return response.data;
  },
};
