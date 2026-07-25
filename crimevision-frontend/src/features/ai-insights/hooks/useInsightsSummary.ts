import { useQuery } from "@tanstack/react-query";
import { insightsApi } from "@/features/ai-insights/api/insights.api";

export function useInsightsSummary() {
  return useQuery({
    queryKey: ["insights", "summary"],
    queryFn: insightsApi.getSummary,
    staleTime: 5 * 60_000,
  });
}
