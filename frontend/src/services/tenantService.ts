import type { Tenant } from "../types/models";
import { apiClient } from "./apiClient";

export const tenantService = {
  list: () => apiClient.get<Tenant[]>("/tenants"),
  create: (tenant: Omit<Tenant, "id">) =>
    apiClient.post<Tenant, Omit<Tenant, "id">>("/tenants", tenant),
};
