import type {
  CreateTenantRequest,
  PagedResult,
  TenantResponse,
  UpdateTenantRequest,
} from "../types/api";
import { httpClient } from "./httpClient";

export const tenantsApi = {
  async list(pageNumber: number, pageSize: number, signal?: AbortSignal) {
    const response = await httpClient.get<PagedResult<TenantResponse>>(
      "/tenants",
      { params: { pageNumber, pageSize }, signal },
    );
    return response.data;
  },
  async me(signal?: AbortSignal) {
    const response = await httpClient.get<TenantResponse>("/tenants/me", {
      signal,
    });
    return response.data;
  },
  async getById(id: string, signal?: AbortSignal) {
    const response = await httpClient.get<TenantResponse>(`/tenants/${id}`, {
      signal,
    });
    return response.data;
  },
  async create(request: CreateTenantRequest) {
    const response = await httpClient.post<TenantResponse>("/tenants", request);
    return response.data;
  },
  async update(id: string, request: UpdateTenantRequest) {
    const response = await httpClient.put<TenantResponse>(
      `/tenants/${id}`,
      request,
    );
    return response.data;
  },
};
