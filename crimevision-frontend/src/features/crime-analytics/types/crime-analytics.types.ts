export interface CrimeFilters {
  district?: string;
  station?: string;
  crimeType?: string;
  dateFrom?: string;
  dateTo?: string;
  victimAgeGroup?: string;
  victimGender?: string;
  offenderAgeGroup?: string;
  status?: string;
}

export interface FilterOptions {
  districts: string[];
  stations: string[];
  crimeTypes: string[];
  statuses: string[];
  ageGroups: string[];
  genders: string[];
}

export interface YearlyTrendPoint {
  year: string;
  count: number;
}

export interface HourlyPoint {
  hour: string;
  count: number;
}

export interface SeasonalPoint {
  season: string;
  count: number;
}

export interface WeekdayPoint {
  day: string;
  count: number;
}

export interface AgeGroupPoint {
  ageGroup: string;
  count: number;
}

export interface GenderPoint {
  gender: string;
  count: number;
}

export interface DistrictComparisonPoint {
  district: string;
  count: number;
}

export interface StationComparisonPoint {
  station: string;
  count: number;
}

export interface CrimeRecord {
  crimeId: string;
  firNumber: string;
  district: string;
  station: string;
  crimeType: string;
  dateTime: string;
  status: "open" | "pending" | "solved" | "closed" | string;
  severityScore: number;
  description: string;
  offenderName?: string;
  offenderIsRepeat?: boolean;
  modusOperandi?: string;
  weaponsUsed?: string;
  targetPlace?: string;
  escapeMethod?: string;
  victimAgeGroup?: string;
  victimGender?: string;
}


export interface CrimeAnalyticsResponse {
  records?: CrimeRecord[];
  monthlyTrend: { label: string; count: number }[];
  yearlyTrend: YearlyTrendPoint[];
  categoryBreakdown: { category: string; count: number }[];
  timeOfDay: HourlyPoint[];
  seasonal: SeasonalPoint[];
  weekday: WeekdayPoint[];
  victimByAge: AgeGroupPoint[];
  victimByGender: GenderPoint[];
  offenderByAge: AgeGroupPoint[];
  repeatOffenderRate: number;
  districtComparison: DistrictComparisonPoint[];
  stationComparison: StationComparisonPoint[];
}

