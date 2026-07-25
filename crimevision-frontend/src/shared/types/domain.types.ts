export type CrimeStatus = "open" | "pending" | "solved";

export interface KpiSummary {
  totalCrimes: number;
  crimesThisMonth: number;
  crimeRateChange: number;
  activeInvestigations: number;
  repeatOffenders: number;
  highRiskDistricts: number;
  activeAlerts: number;
}

export interface CrimeCategoryPoint {
  category: string;
  count: number;
}

export interface DistrictRankPoint {
  district: string;
  count: number;
  riskLevel: "low" | "moderate" | "high" | "critical";
  lowCount?: number;
  moderateCount?: number;
  highCount?: number;
  criticalCount?: number;
  openCount?: number;
  pendingCount?: number;
  solvedCount?: number;
  closedCount?: number;
}

export interface StationRankPoint {
  station: string;
  district: string;
  solvedRate: number;
  caseload: number;
}

export interface TrendPoint {
  label: string;
  crimes: number;
  solved: number;
}

export interface FeedItem {
  id: string;
  title: string;
  district: string;
  severity: "low" | "moderate" | "high" | "critical";
  timestamp: string;
}

export interface StatusPoint {
  status: string;
  count: number;
  percentage: number;
}

export interface DashboardSummaryResponse {
  kpis: KpiSummary;
  crimeByCategory: CrimeCategoryPoint[];
  districtRanking: DistrictRankPoint[];
  topStations: StationRankPoint[];
  monthlyTrend: TrendPoint[];
  feed: FeedItem[];
  statusBreakdown?: StatusPoint[];
}
