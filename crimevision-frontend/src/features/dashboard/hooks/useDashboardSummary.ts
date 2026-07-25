import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/features/dashboard/api/dashboard.api";
import { queryKeys } from "@/shared/lib/query-keys";

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboardSummary,
    queryFn: dashboardApi.getSummary,
    staleTime: 60_000,
  });
}
