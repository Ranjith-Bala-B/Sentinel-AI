import { apiClient } from "@/shared/lib/api-client";

export interface InsightsResult {
  summary: string;
  trendSummary: string;
  topFindings: string[];
  recommendations: string[];
}

export const insightsApi = {
  getSummary: (): Promise<InsightsResult> => apiClient.get<InsightsResult>("/insights/summary"),
};
