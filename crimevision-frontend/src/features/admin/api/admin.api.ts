import { apiClient } from "@/shared/lib/api-client";

export interface AdminKpis {
  policeStationsConnected: number;
  registeredOfficers: number;
  todaysLoginCount: number;
  totalFirRecords: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  status: string;
}

export interface AdminSummaryResponse {
  kpis: AdminKpis;
  users: AdminUser[];
  stationCrimeCounts?: Record<string, number>;
}

export const adminApi = {
  async getSummary(): Promise<AdminSummaryResponse> {
    return apiClient.get<AdminSummaryResponse>("/admin/summary");
  },
};
