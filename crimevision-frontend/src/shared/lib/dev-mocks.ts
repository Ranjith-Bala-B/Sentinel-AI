/**
 * Local-development-only mocks for API routes that don't yet have a
 * deployed Catalyst backend to hit. Used exclusively by api-client's
 * network-failure fallback (see api-client.ts) - never referenced in
 * a production build path.
 */

export const KARNATAKA_DISTRICTS = [
  "Bagalkote", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
  "Bidar", "Chamarajanagara", "Chikkaballapura", "Chikkamagaluru", "Chitradurga",
  "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
  "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal",
  "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga",
  "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara", "Yadgir"
];

export const ALL_CRIME_TYPES = [
  "Theft", "Cybercrime", "Assault", "Burglary", "Vehicle theft",
  "Fraud", "Narcotics", "Robbery", "Homicide", "Extortion", "Domestic Violence", "Vandalism"
];

export const ALL_POLICE_STATIONS = [
  "Whitefield PS", "Devanahalli PS", "Nazarbad PS", "Ballari City PS",
  "Hubballi Central PS", "M.G. Road PS", "Koramangala PS", "Indiranagar PS",
  "Cubbon Park PS", "Udupi Town PS", "Mangaluru North PS", "Belagavi Town PS",
  "Hassan Town PS", "Kalaburagi Central PS", "Tumakuru City PS"
];

interface MockRecord {
  crimeId: string;
  firNumber: string;
  district: string;
  station: string;
  crimeType: string;
  dateTime: string;
  status: string;
  severityScore: number;
  description: string;
  offenderName?: string;
  offenderIsRepeat?: boolean;
  victimAgeGroup?: string;
  victimGender?: string;
}

const SEED_RECORDS: MockRecord[] = [
  { crimeId: "CR-2026-00101", firNumber: "0012/2026", district: "Bengaluru Urban", station: "Whitefield PS", crimeType: "Cybercrime", dateTime: "2026-06-14T10:30:00", status: "solved", severityScore: 82, description: "Phishing attack targeting senior citizens bank accounts", offenderName: "Rahul Sharma", offenderIsRepeat: true, victimAgeGroup: "60+", victimGender: "Male" },
  { crimeId: "CR-2026-00102", firNumber: "0015/2026", district: "Bengaluru Urban", station: "Koramangala PS", crimeType: "Theft", dateTime: "2026-06-18T14:15:00", status: "open", severityScore: 55, description: "Laptops stolen from tech park co-working space", offenderName: "Unknown", offenderIsRepeat: false, victimAgeGroup: "18-30", victimGender: "Female" },
  { crimeId: "CR-2026-00103", firNumber: "0021/2026", district: "Bengaluru Urban", station: "Indiranagar PS", crimeType: "Vehicle theft", dateTime: "2026-07-02T22:00:00", status: "pending", severityScore: 68, description: "Two-wheeler stolen from residential parking area", offenderName: "Suresh Kumar", offenderIsRepeat: true, victimAgeGroup: "31-45", victimGender: "Male" },
  { crimeId: "CR-2026-00104", firNumber: "0030/2026", district: "Mysuru", station: "Nazarbad PS", crimeType: "Burglary", dateTime: "2026-05-10T03:00:00", status: "solved", severityScore: 78, description: "Jewelry burglary at locked residence during night", offenderName: "Venkatesh M", offenderIsRepeat: false, victimAgeGroup: "46-60", victimGender: "Female" },
  { crimeId: "CR-2026-00105", firNumber: "0034/2026", district: "Mysuru", station: "Nazarbad PS", crimeType: "Fraud", dateTime: "2026-06-01T11:45:00", status: "open", severityScore: 60, description: "Real estate investment scam forged documents", offenderName: "Anand Rao", offenderIsRepeat: true, victimAgeGroup: "31-45", victimGender: "Male" },
  { crimeId: "CR-2026-00106", firNumber: "0041/2026", district: "Ballari", station: "Ballari City PS", crimeType: "Assault", dateTime: "2026-04-22T19:30:00", status: "solved", severityScore: 85, description: "Physical assault outside commercial market plaza", offenderName: "Ketan Naik", offenderIsRepeat: true, victimAgeGroup: "18-30", victimGender: "Male" },
  { crimeId: "CR-2026-00107", firNumber: "0048/2026", district: "Belagavi", station: "Belagavi Town PS", crimeType: "Narcotics", dateTime: "2026-05-19T21:00:00", status: "solved", severityScore: 90, description: "Possession and distribution of contraband substances", offenderName: "Dinesh Patel", offenderIsRepeat: false, victimAgeGroup: "18-30", victimGender: "Male" },
  { crimeId: "CR-2026-00108", firNumber: "0052/2026", district: "Hubballi-Dharwad", station: "Hubballi Central PS", crimeType: "Robbery", dateTime: "2026-06-25T23:15:00", status: "pending", severityScore: 88, description: "Armed robbery at highway petrol pump outlet", offenderName: "Unidentified Gang", offenderIsRepeat: true, victimAgeGroup: "31-45", victimGender: "Male" },
  { crimeId: "CR-2026-00109", firNumber: "0060/2026", district: "Mangaluru", station: "Mangaluru North PS", crimeType: "Cybercrime", dateTime: "2026-07-01T09:00:00", status: "open", severityScore: 72, description: "Corporate email compromise and unauthorized wire transfer", offenderName: "Unknown", offenderIsRepeat: false, victimAgeGroup: "31-45", victimGender: "Male" },
  { crimeId: "CR-2026-00110", firNumber: "0067/2026", district: "Udupi", station: "Udupi Town PS", crimeType: "Theft", dateTime: "2026-06-12T16:20:00", status: "closed", severityScore: 40, description: "Snatching of handbag near coastal tourist promenade", offenderName: "Manjunath", offenderIsRepeat: false, victimAgeGroup: "18-30", victimGender: "Female" },
  { crimeId: "CR-2026-00111", firNumber: "0072/2026", district: "Tumakuru", station: "Tumakuru City PS", crimeType: "Vandalism", dateTime: "2026-05-28T02:40:00", status: "solved", severityScore: 48, description: "Damaging public CCTV infrastructure and streetlamps", offenderName: "Ramesh Babu", offenderIsRepeat: false, victimAgeGroup: "18-30", victimGender: "Male" },
  { crimeId: "CR-2026-00112", firNumber: "0079/2026", district: "Hassan", station: "Hassan Town PS", crimeType: "Extortion", dateTime: "2026-06-08T15:00:00", status: "open", severityScore: 79, description: "Blackmail and extortion calls made to local business owner", offenderName: "Vikram Reddy", offenderIsRepeat: true, victimAgeGroup: "46-60", victimGender: "Male" },
  { crimeId: "CR-2026-00113", firNumber: "0085/2026", district: "Kalaburagi", station: "Kalaburagi Central PS", crimeType: "Homicide", dateTime: "2026-04-10T22:50:00", status: "solved", severityScore: 98, description: "Fatal clash arising from long-standing land boundary dispute", offenderName: "Sharanappa", offenderIsRepeat: false, victimAgeGroup: "46-60", victimGender: "Male" },
  { crimeId: "CR-2026-00114", firNumber: "0091/2026", district: "Bengaluru Rural", station: "Devanahalli PS", crimeType: "Domestic Violence", dateTime: "2026-07-05T18:10:00", status: "pending", severityScore: 65, description: "Physical abuse complaint filed by spouse under Section 498A", offenderName: "Praveen Gowda", offenderIsRepeat: false, victimAgeGroup: "31-45", victimGender: "Female" },
  { crimeId: "CR-2026-00115", firNumber: "0098/2026", district: "Dakshina Kannada", station: "Mangaluru North PS", crimeType: "Fraud", dateTime: "2026-06-30T12:00:00", status: "open", severityScore: 62, description: "Cryptocurrency investment opportunity fraud", offenderName: "Karthik Hegde", offenderIsRepeat: true, victimAgeGroup: "18-30", victimGender: "Male" }
];

// Dynamically generate records for other districts to guarantee every district has sample data
function getFullDataset(): MockRecord[] {
  const full = [...SEED_RECORDS];
  let idCount = 116;

  KARNATAKA_DISTRICTS.forEach((district) => {
    const existing = full.filter((r) => r.district === district);
    if (existing.length === 0) {
      ALL_CRIME_TYPES.slice(0, 3).forEach((crimeType, idx) => {
        full.push({
          crimeId: `CR-2026-${String(idCount++).padStart(5, "0")}`,
          firNumber: `0${idCount}/2026`,
          district,
          station: `${district} Town PS`,
          crimeType,
          dateTime: `2026-06-${String(10 + idx * 5).padStart(2, "0")}T14:00:00`,
          status: idx % 2 === 0 ? "solved" : "open",
          severityScore: 50 + idx * 12,
          description: `Reported incident of ${crimeType} registered in ${district} district limits.`,
          offenderName: idx % 2 === 0 ? "Suspect Identified" : "Under Investigation",
          offenderIsRepeat: idx === 0,
          victimAgeGroup: "31-45",
          victimGender: "Male"
        });
      });
    }
  });

  return full;
}

const ALL_MOCK_RECORDS = getFullDataset();

function canned(question: string): string {
  const q = question.toLowerCase().trim();

  // A. Specific Karnataka District Mentions
  const known_districts = ["bengaluru", "mysuru", "ballari", "belagavi", "hubballi", "mangaluru", "shimoga", "tumakuru", "chikkaballapur", "hassan", "kolar", "udupi", "kalaburagi", "davanagere"];
  const matched_district = known_districts.find((d) => q.includes(d));

  if (matched_district) {
    let d_name = matched_district.charAt(0).toUpperCase() + matched_district.slice(1);
    if (matched_district === "bengaluru") d_name = "Bengaluru Urban";

    const isBengaluru = matched_district === "bengaluru";
    const d_count = isBengaluru ? 14210 : matched_district === "mysuru" ? 5340 : matched_district === "ballari" ? 3120 : 1850;
    const d_risk = isBengaluru ? "CRITICAL" : matched_district === "mysuru" ? "HIGH" : "MODERATE";

    if (q.includes("hotspot") || q.includes("map") || q.includes("patrol") || q.includes("location")) {
      return `Intelligence Analysis for ${d_name}: Identified 5 active high-density crime clusters concentrated in urban beats (${d_count.toLocaleString()} total reported cases). Risk assessment classification: ${d_risk}. Opening Geo Intelligence...`;
    }
    return `District Intelligence Report (${d_name}): Currently accounts for ${d_count.toLocaleString()} reported incidents with a ${d_risk} risk classification. Primary drivers include vehicle theft and cybercrime. Specialized patrolling units are deployed across primary beats.`;
  }

  // B. Specific Crime Category Mentions
  const known_crimes = ["theft", "cybercrime", "cyber", "burglary", "assault", "homicide", "murder", "narcotics", "drugs", "robbery", "extortion"];
  const matched_crime = known_crimes.find((c) => q.includes(c));

  if (matched_crime) {
    let c_name = matched_crime.charAt(0).toUpperCase() + matched_crime.slice(1);
    if (matched_crime === "cyber") c_name = "Cybercrime";
    const c_count = matched_crime.includes("theft") ? 12840 : matched_crime.includes("cyber") ? 10450 : 7820;

    return `Crime Category Analysis (${c_name}): A total of ${c_count.toLocaleString()} cases of ${c_name} are recorded in the database. This category represents a major focus area for state investigations, with highest concentration in Bengaluru Urban and Mysuru. High-frequency hotspots are continuously monitored via AI predictive risk models.`;
  }

  // C. Hotspots / Geo Intelligence Intent
  if (q.includes("hotspot") || q.includes("map") || q.includes("patrol") || q.includes("cluster") || q.includes("spatial")) {
    return "Hotspot Intelligence Summary: 27 high-density crime clusters are currently active across Karnataka State. Hotspots are densest in commercial corridors and transit hubs. Opening Geo Intelligence...";
  }

  // D. Repeat Offenders / Suspects / Gangs
  if (q.includes("repeat") || q.includes("offender") || q.includes("suspect") || q.includes("habitual") || q.includes("gang")) {
    return "Repeat Offender Tracking: 2,140 habitual offenders are cataloged in the system with verified Modus Operandi (MO) profiles. Recidivism is highest in vehicle theft and burglary categories. Opening Repeat Offenders...";
  }

  // E. Predictions / AI Forecasts / Future Trends
  if (q.includes("predict") || q.includes("forecast") || q.includes("future") || q.includes("next month") || q.includes("30 day")) {
    return "Predictive Intelligence Model: AI forecasting projects ~4,350 crime incidents over the next 30 days (89% model confidence). Expected surges are flagged in nighttime burglary and online cyber fraud. Opening Predictions...";
  }

  // F. Solved Rates / Clearance / Case Totals
  if (q.includes("total") || q.includes("how many crime") || q.includes("volume") || q.includes("count")) {
    return "Overall Caseload Summary: Total recorded crimes stand at 48,213 across Karnataka State. 31,820 cases have been solved to date, achieving a state-wide solve rate of 66.0%.";
  }

  if (q.includes("solved") || q.includes("clearance") || q.includes("rate")) {
    return "Caseload Clearance Status: Karnataka State Police maintains a 66.0% overall solve rate (31,820 solved out of 48,213 total cases). Top performing stations achieve solve rates exceeding 78%.";
  }

  // G. District Risk Rankings
  if (q.includes("district") || q.includes("ranking") || q.includes("high risk") || q.includes("worst")) {
    return "State District Risk Rankings: Bengaluru Urban (Critical Risk - 14,210 cases), Mysuru (High Risk - 5,340 cases), and Ballari (Moderate Risk - 3,120 cases) lead the state caseload.";
  }

  // H. Truly Dynamic Fallback for ANY prompt (Extracts Subject & Constructs Custom Analysis)
  const words = q.split(/\s+/).filter((w) => w.length > 3 && !["what", "show", "tell", "give", "have", "with", "this", "that", "from", "about"].includes(w));
  const topic = words.length > 0 ? `'${words.slice(0, 3).join(" ")}'` : `'${q.slice(0, 25)}'`;

  return `Analysis Report for ${topic}: Evaluated request against 48,213 active analytical records across Karnataka's 31 police districts. State clearance rate stands at 66.0% with 2,140 flagged repeat offenders. For localized spatial maps, station caseloads, or MO breakdowns, visit the Crime Analytics or Hotspot Intelligence dashboards.`;
}

const PREDICTION_OVERVIEW_MOCK = {
  predictedCrimes30d: 4350,
  highRiskLocations: 27,
  riskScore: 72,
  confidenceLevel: 89,
  insights: [
    "Increase in Burglary cases expected during late night hours (11 PM - 3 AM).",
    "High risk of Cybercrime surge flagged in Whitefield & Electronic City.",
    "Night patrolling recommended between 11 PM to 3 AM in Yelahanka PS limits.",
    "Additional CCTV deployment in Hubballi will decrease vehicle thefts by ~30%."
  ]
};

const PREDICTION_FORECAST_MOCK = [
  { label: "Jul", actual: 3820, predicted: 3910 },
  { label: "Aug", actual: 4120, predicted: 4050 },
  { label: "Sep", actual: 3950, predicted: 4010 },
  { label: "Oct", actual: 4310, predicted: 4280 },
  { label: "Nov", actual: 0, predicted: 4420 },
  { label: "Dec", actual: 0, predicted: 4610 }
];

const PREDICTION_HEATMAP_MOCK = (() => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
  const cells: { day: string; hour: string; risk: number }[] = [];
  days.forEach((day) => {
    hours.forEach((hour) => {
      const hInt = parseInt(hour.split(":")[0], 10);
      let risk = 20;
      if (hInt >= 22 || hInt <= 4) risk = 65 + Math.floor(Math.random() * 30);
      else if (hInt >= 14 && hInt <= 18) risk = 40 + Math.floor(Math.random() * 25);
      else risk = 15 + Math.floor(Math.random() * 25);
      cells.push({ day, hour, risk });
    });
  });
  return cells;
})();

const INSIGHTS_MOCK = {
  summary:
    "The state recorded 48,213 cases this period with a 66% solve rate. Bengaluru Urban remains the dominant contributor, accounting for nearly 30% of total volume.",
  trendSummary:
    "Reported crime grew 4.1% over the trailing period, with the steepest increases concentrated in the second half of the year.",
  topFindings: [
    "Theft and cybercrime together account for over 40% of all reported cases.",
    "Bengaluru Urban is classified critical risk; five districts sit at moderate or higher.",
    "Repeat offenders number 2,140, concentrated in vehicle theft and burglary cases.",
  ],
  recommendations: [
    "Prioritize cybercrime response capacity in Bengaluru Urban given category share.",
    "Expand repeat-offender tracking to Mysuru and Ballari given their high-risk classification.",
    "Review station-level solve rates below 60% for resourcing gaps.",
  ],
};

export async function getDevMock<T>(path: string, init?: RequestInit): Promise<T | undefined> {
  await new Promise((r) => setTimeout(r, 200));

  if (path === "/assistant/query" && init?.body) {
    const body = JSON.parse(init.body as string) as { question: string };
    return { answer: canned(body.question) } as unknown as T;
  }

  if (path === "/predictions/overview") {
    return PREDICTION_OVERVIEW_MOCK as unknown as T;
  }
  if (path === "/predictions/forecast") {
    return PREDICTION_FORECAST_MOCK as unknown as T;
  }
  if (path === "/predictions/heatmap") {
    return PREDICTION_HEATMAP_MOCK as unknown as T;
  }

  if (path === "/insights/summary" || path.startsWith("/insights/district/")) {
    return INSIGHTS_MOCK as unknown as T;
  }

  if (path.includes("/status") && init?.method === "PATCH" && init?.body) {
    const body = JSON.parse(init.body as string) as { status: string };
    const parts = path.split("/");
    const crimeId = parts[2];
    const rec = ALL_MOCK_RECORDS.find((r) => r.crimeId === crimeId);
    if (rec) {
      rec.status = body.status;
    }
    return { crimeId, status: body.status } as unknown as T;
  }

  if (path.startsWith("/crimes/") && init?.method === "DELETE") {
    const parts = path.split("/");
    const crimeId = parts[2];
    const index = ALL_MOCK_RECORDS.findIndex((r) => r.crimeId === crimeId);
    if (index !== -1) {
      ALL_MOCK_RECORDS.splice(index, 1);
    }
    return { message: `Crime record ${crimeId} deleted successfully`, crimeId } as unknown as T;
  }

  if (path === "/crimes/filters") {
    return {
      districts: KARNATAKA_DISTRICTS,
      stations: ALL_POLICE_STATIONS,
      crimeTypes: ALL_CRIME_TYPES,
      statuses: ["open", "pending", "solved", "closed"],
      ageGroups: ["0-17", "18-30", "31-45", "46-60", "60+"],
      genders: ["Male", "Female", "Other"]
    } as unknown as T;
  }

  if (path.startsWith("/crimes/trends") || path.startsWith("/crimes?")) {
    const url = new URL(`http://localhost${path}`);
    const district = url.searchParams.get("district");
    const station = url.searchParams.get("station");
    const crimeType = url.searchParams.get("crimeType");
    const status = url.searchParams.get("status");
    const victimAgeGroup = url.searchParams.get("victimAgeGroup");
    const victimGender = url.searchParams.get("victimGender");

    const isWildcard = (val: string | null) =>
      !val || val.trim() === "" || val.toLowerCase().startsWith("all");

    let filtered = ALL_MOCK_RECORDS.filter((r) => {
      if (!isWildcard(district) && r.district.toLowerCase() !== district!.toLowerCase()) return false;
      if (!isWildcard(station) && r.station.toLowerCase() !== station!.toLowerCase()) return false;
      if (!isWildcard(crimeType) && r.crimeType.toLowerCase() !== crimeType!.toLowerCase()) return false;
      if (!isWildcard(status) && r.status.toLowerCase() !== status!.toLowerCase()) return false;
      if (!isWildcard(victimAgeGroup) && r.victimAgeGroup !== victimAgeGroup) return false;
      if (!isWildcard(victimGender) && r.victimGender !== victimGender) return false;
      return true;
    });


    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyCounts: Record<string, number> = {};
    months.forEach((m) => (monthlyCounts[m] = 0));

    const categoryCounts: Record<string, number> = {};
    const districtCounts: Record<string, number> = {};
    const stationCounts: Record<string, number> = {};

    filtered.forEach((r) => {
      const monthIdx = r.dateTime ? new Date(r.dateTime).getMonth() : 0;
      const mLabel = months[monthIdx] || "Jan";
      monthlyCounts[mLabel] = (monthlyCounts[mLabel] || 0) + 1;

      categoryCounts[r.crimeType] = (categoryCounts[r.crimeType] || 0) + 1;
      districtCounts[r.district] = (districtCounts[r.district] || 0) + 1;
      stationCounts[r.station] = (stationCounts[r.station] || 0) + 1;
    });

    const monthlyTrend = months.map((m) => ({ label: m, count: monthlyCounts[m] }));
    const categoryBreakdown = Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));
    const districtComparison = Object.entries(districtCounts).map(([district, count]) => ({ district, count }));
    const stationComparison = Object.entries(stationCounts).map(([station, count]) => ({ station, count }));

    const yearlyTrend = [
      { year: "2023", count: Math.round(filtered.length * 0.7) },
      { year: "2024", count: Math.round(filtered.length * 0.85) },
      { year: "2025", count: Math.round(filtered.length * 0.95) },
      { year: "2026", count: filtered.length }
    ];

    const result = {
      records: filtered.map(({ victimAgeGroup, victimGender, ...rec }) => rec),
      monthlyTrend,
      yearlyTrend,
      categoryBreakdown,
      timeOfDay: [
        { hour: "00-03", count: Math.ceil(filtered.length * 0.1) },
        { hour: "03-06", count: Math.ceil(filtered.length * 0.05) },
        { hour: "06-09", count: Math.ceil(filtered.length * 0.1) },
        { hour: "09-12", count: Math.ceil(filtered.length * 0.2) },
        { hour: "12-15", count: Math.ceil(filtered.length * 0.15) },
        { hour: "15-18", count: Math.ceil(filtered.length * 0.15) },
        { hour: "18-21", count: Math.ceil(filtered.length * 0.15) },
        { hour: "21-24", count: Math.ceil(filtered.length * 0.1) }
      ],
      seasonal: [
        { season: "Winter", count: Math.ceil(filtered.length * 0.25) },
        { season: "Summer", count: Math.ceil(filtered.length * 0.3) },
        { season: "Monsoon", count: Math.ceil(filtered.length * 0.2) },
        { season: "Festival period", count: Math.ceil(filtered.length * 0.25) }
      ],
      weekday: [
        { day: "Mon", count: Math.ceil(filtered.length * 0.15) },
        { day: "Tue", count: Math.ceil(filtered.length * 0.14) },
        { day: "Wed", count: Math.ceil(filtered.length * 0.14) },
        { day: "Thu", count: Math.ceil(filtered.length * 0.13) },
        { day: "Fri", count: Math.ceil(filtered.length * 0.16) },
        { day: "Sat", count: Math.ceil(filtered.length * 0.15) },
        { day: "Sun", count: Math.ceil(filtered.length * 0.13) }
      ],
      victimByAge: [
        { ageGroup: "0-17", count: Math.ceil(filtered.length * 0.05) },
        { ageGroup: "18-30", count: Math.ceil(filtered.length * 0.35) },
        { ageGroup: "31-45", count: Math.ceil(filtered.length * 0.35) },
        { ageGroup: "46-60", count: Math.ceil(filtered.length * 0.15) },
        { ageGroup: "60+", count: Math.ceil(filtered.length * 0.1) }
      ],
      victimByGender: [
        { gender: "Male", count: Math.ceil(filtered.length * 0.6) },
        { gender: "Female", count: Math.ceil(filtered.length * 0.38) },
        { gender: "Other", count: Math.ceil(filtered.length * 0.02) }
      ],
      offenderByAge: [
        { ageGroup: "0-17", count: Math.ceil(filtered.length * 0.08) },
        { ageGroup: "18-30", count: Math.ceil(filtered.length * 0.55) },
        { ageGroup: "31-45", count: Math.ceil(filtered.length * 0.25) },
        { ageGroup: "46-60", count: Math.ceil(filtered.length * 0.1) },
        { ageGroup: "60+", count: Math.ceil(filtered.length * 0.02) }
      ],
      repeatOffenderRate: filtered.length > 0 ? 28.5 : 0.0,
      districtComparison,
      stationComparison
    };

    return result as unknown as T;
  }

  return undefined;
}
