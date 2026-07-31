import axios from "axios";
import type { HealthResponse } from "../types/api";

function getApiOrigin() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;
  if (!configuredUrl) return "";
  return configuredUrl.replace(/\/api\/?$/, "");
}

export const healthApi = {
  async live(signal?: AbortSignal) {
    const response = await axios.get<HealthResponse>(
      `${getApiOrigin()}/health/live`,
      { signal, timeout: 15_000, headers: { Accept: "application/json" } },
    );
    return response.data;
  },
  async ready(signal?: AbortSignal) {
    const response = await axios.get<HealthResponse>(
      `${getApiOrigin()}/health/ready`,
      { signal, timeout: 15_000, headers: { Accept: "application/json" } },
    );
    return response.data;
  },
};
