import type {
  AddMaintenanceProgressRequest,
  CloseMaintenanceRequestRequest,
  CreateMaintenanceRequestRequest,
  MaintenanceRequestResponse,
  MaintenanceRequestStatus,
  PagedQuery,
  PagedResult,
  ResolveMaintenanceRequestRequest,
  StartMaintenanceRequestRequest,
} from "../types/api";
import { httpClient } from "./httpClient";

export const maintenanceApi = {
  async list(query: PagedQuery<MaintenanceRequestStatus>, signal?: AbortSignal) {
    const response = await httpClient.get<
      PagedResult<MaintenanceRequestResponse>
    >("/maintenance-requests", { params: query, signal });
    return response.data;
  },
  async getById(id: string, signal?: AbortSignal) {
    const response = await httpClient.get<MaintenanceRequestResponse>(
      `/maintenance-requests/${id}`,
      { signal },
    );
    return response.data;
  },
  async create(request: CreateMaintenanceRequestRequest) {
    const response = await httpClient.post<MaintenanceRequestResponse>(
      "/maintenance-requests",
      request,
    );
    return response.data;
  },
  async start(id: string, request: StartMaintenanceRequestRequest) {
    const response = await httpClient.post<MaintenanceRequestResponse>(
      `/maintenance-requests/${id}/start`,
      request,
    );
    return response.data;
  },
  async addProgressNote(id: string, request: AddMaintenanceProgressRequest) {
    const response = await httpClient.post<MaintenanceRequestResponse>(
      `/maintenance-requests/${id}/progress-notes`,
      request,
    );
    return response.data;
  },
  async resolve(id: string, request: ResolveMaintenanceRequestRequest) {
    const response = await httpClient.post<MaintenanceRequestResponse>(
      `/maintenance-requests/${id}/resolve`,
      request,
    );
    return response.data;
  },
  async close(id: string, request: CloseMaintenanceRequestRequest) {
    const response = await httpClient.post<MaintenanceRequestResponse>(
      `/maintenance-requests/${id}/close`,
      request,
    );
    return response.data;
  },
};
