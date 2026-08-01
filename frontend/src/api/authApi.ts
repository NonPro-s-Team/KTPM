import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
} from "../types/api";
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
  async forgotPassword(request: RequestPasswordResetRequest) {
    await httpClient.post("/auth/forgot-password", request);
  },
  async resetPassword(request: ResetPasswordRequest) {
    await httpClient.post("/auth/reset-password", request);
  },
};
