import type { ChangePasswordRequest, LoginRequest, LoginResponse } from "../types/api";
import { httpClient } from "./httpClient";

export const authApi = {
  async login(request: LoginRequest, signal?: AbortSignal) {
    const response = await httpClient.post<LoginResponse>("/auth/login", request, {
      signal,
    });
    return response.data;
  },
  async logout() {
    await httpClient.post("/auth/logout");
  },
  async changePassword(request: ChangePasswordRequest) {
    await httpClient.post("/auth/change-password", request);
  },
};
