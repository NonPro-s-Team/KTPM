import type { Contract } from "../types/models";
import { apiClient } from "./apiClient";

export const contractService = {
  list: () => apiClient.get<Contract[]>("/contracts"),
  create: (contract: Omit<Contract, "id">) =>
    apiClient.post<Contract, Omit<Contract, "id">>("/contracts", contract),
};
