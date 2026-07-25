import { apiClient } from "@/shared/lib/api-client";
import type { CrimeAnalyticsResponse, CrimeFilters, FilterOptions } from "@/features/crime-analytics/types/crime-analytics.types";

export const crimeAnalyticsApi = {
  async getFilterOptions(): Promise<FilterOptions> {
    return apiClient.get<FilterOptions>("/crimes/filters");
  },

  async getAnalytics(filters: CrimeFilters): Promise<CrimeAnalyticsResponse> {
    const params = new URLSearchParams();
    if (filters.district) params.append("district", filters.district);
    if (filters.station) params.append("station", filters.station);
    if (filters.crimeType) params.append("crimeType", filters.crimeType);
    if (filters.status) params.append("status", filters.status);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);
    if (filters.victimAgeGroup) params.append("victimAgeGroup", filters.victimAgeGroup);
    if (filters.victimGender) params.append("victimGender", filters.victimGender);

    return apiClient.get<CrimeAnalyticsResponse>(`/crimes/trends?${params.toString()}`);
  },

  async updateStatus(crimeId: string, status: string): Promise<{ crimeId: string; status: string }> {
    return apiClient.patch<{ crimeId: string; status: string }>(`/crimes/${crimeId}/status`, { status });
  },

  async deleteCrime(crimeId: string): Promise<{ message: string; crimeId: string }> {
    return apiClient.delete<{ message: string; crimeId: string }>(`/crimes/${crimeId}`);
  },
};

