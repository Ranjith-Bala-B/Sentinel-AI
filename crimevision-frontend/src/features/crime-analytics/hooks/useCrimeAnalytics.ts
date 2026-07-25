import { useQuery } from "@tanstack/react-query";
import { crimeAnalyticsApi } from "@/features/crime-analytics/api/crime-analytics.api";
import type { CrimeFilters } from "@/features/crime-analytics/types/crime-analytics.types";

export function useCrimeAnalytics(filters: CrimeFilters) {
  return useQuery({
    queryKey: ["crime-analytics", filters],
    queryFn: () => crimeAnalyticsApi.getAnalytics(filters),
    staleTime: 30_000,
  });
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ["crime-analytics", "filter-options"],
    queryFn: crimeAnalyticsApi.getFilterOptions,
    staleTime: 5 * 60_000,
  });
}
