import type { DashboardSummaryResponse } from "../types/api";
import { httpClient } from "./httpClient";

export const dashboardApi = {
  async getSummary(signal?: AbortSignal) {
    const response = await httpClient.get<DashboardSummaryResponse>(
      "/dashboard/summary",
      { signal },
    );
    return response.data;
  },
};
