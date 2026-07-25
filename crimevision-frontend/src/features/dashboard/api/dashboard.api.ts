import { apiClient } from "@/shared/lib/api-client";
import type { DashboardSummaryResponse } from "@/shared/types/domain.types";

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummaryResponse> {
    return apiClient.get<DashboardSummaryResponse>("/dashboard/summary");
  },
};
