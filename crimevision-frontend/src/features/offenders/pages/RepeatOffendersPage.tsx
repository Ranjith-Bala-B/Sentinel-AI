import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { apiClient } from "@/shared/lib/api-client";
import { Users, ShieldAlert, Clock, MapPin, Search, Filter, Flame, Layers, AlertTriangle, FileText } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";

interface OffenderListItem {
  id: string;
  name: string;
  repeatCount: number;
  casesCount: number;
  solvedCount: number;
  pendingCount: number;
  riskScore: number;
  riskLevel: string;
  district: string;
  policeStation: string;
  crimeType: string;
  latestCrimeDate: string;
}

interface OffenderStats {
  totalRepeatOffenders: number;
  highestRiskOffender: {
    name: string;
    score: number;
    district: string;
  };
  avgCrimesPerOffender: number;
  mostCommonCrimeType: string;
  mostActiveDistrict: string;
  mostCommonMO: string;
}

interface OffenderProfile {
  name: string;
  age: number;
  gender: string;
  aliases: string;
  address: string;
  district: string;
  policeStation: string;
  firstOffense: string;
  lastOffense: string;
  riskScore: number;
  riskLevel: string;
  repeatCount: number;
  casesCount: number;
  solvedCases: number;
  pendingCases: number;
  crimeCategories: string[];
}

interface ModusOperandi {
  name: string;
  commonMethod: string;
  commonCrime: string;
  commonTime: string;
  preferredTargets: string;
  commonLocation: string;
  weaponsUsed: string;
  escapeMethod: string;
  crimeFrequency: string;
  moSimilarityScore: number;
  behavioralSummary: string;
}

interface TimelineItem {
  id: string;
  fir: string;
  year: number;
  date: string;
  crimeType: string;
  district: string;
  station: string;
  status: string;
  severityScore: number;
  description: string;
}

const KARNATAKA_DISTRICTS = [
  "ALL",
  "Bagalkote",
  "Ballari",
  "Belagavi",
  "Bengaluru Rural",
  "Bengaluru Urban",
  "Bidar",
  "Chamarajanagara",
  "Chikkaballapura",
  "Chikkamagaluru",
  "Chitradurga",
  "Dakshina Kannada",
  "Davanagere",
  "Dharwad",
  "Gadag",
  "Hassan",
  "Haveri",
  "Kalaburagi",
  "Kodagu",
  "Kolar",
  "Koppal",
  "Mandya",
  "Mysuru",
  "Raichur",
  "Ramanagara",
  "Shivamogga",
  "Tumakuru",
  "Udupi",
  "Uttara Kannada",
  "Vijayapura",
  "Vijayanagara",
  "Yadgir"
];

const CRIME_TYPES = [
  "ALL",
  "Theft",
  "Cybercrime",
  "Assault",
  "Burglary",
  "Vehicle theft",
  "Fraud",
  "Narcotics"
];

export function RepeatOffendersPage() {
  const [selectedOffenderName, setSelectedOffenderName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"repeat_count" | "risk_score" | "name">("repeat_count");

  // Fetch Dashboard Stats from MySQL
  const { data: stats } = useQuery<OffenderStats>({
    queryKey: ["offenders", "stats"],
    queryFn: () => apiClient.get<OffenderStats>("/repeat-offenders/stats"),
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Fetch Repeat Offenders List from MySQL
  const { data: offenders = [], isLoading: loadingList, isError: isListError, error: listError } = useQuery<OffenderListItem[]>({
    queryKey: ["offenders", "repeat", districtFilter, typeFilter, sortBy, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (districtFilter !== "ALL") params.append("district", districtFilter);
      if (typeFilter !== "ALL") params.append("crimeType", typeFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      params.append("sortBy", sortBy);

      const url = `/repeat-offenders?${params.toString()}`;
      const data = await apiClient.get<OffenderListItem[]>(url);
      
      // Auto select first offender if current selection is invalid
      if (data.length > 0) {
        if (!selectedOffenderName || !data.some(o => o.name === selectedOffenderName)) {
          setSelectedOffenderName(data[0].name);
        }
      }
      return data;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Fetch Profile of Selected Offender
  const { data: profile = null, isLoading: loadingProfile } = useQuery<OffenderProfile | null>({
    queryKey: ["offenders", "profile", selectedOffenderName],
    queryFn: () => (selectedOffenderName ? apiClient.get<OffenderProfile>(`/repeat-offenders/${encodeURIComponent(selectedOffenderName)}/profile`) : Promise.resolve(null)),
    enabled: !!selectedOffenderName,
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Fetch Modus Operandi of Selected Offender
  const { data: mo = null, isLoading: loadingMo } = useQuery<ModusOperandi | null>({
    queryKey: ["offenders", "modus-operandi", selectedOffenderName],
    queryFn: () => (selectedOffenderName ? apiClient.get<ModusOperandi>(`/repeat-offenders/${encodeURIComponent(selectedOffenderName)}/modus-operandi`) : Promise.resolve(null)),
    enabled: !!selectedOffenderName,
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Fetch Timeline of Selected Offender
  const { data: timeline = [], isLoading: loadingTimeline } = useQuery<TimelineItem[]>({
    queryKey: ["offenders", "timeline", selectedOffenderName],
    queryFn: () => (selectedOffenderName ? apiClient.get<TimelineItem[]>(`/repeat-offenders/${encodeURIComponent(selectedOffenderName)}/timeline`) : Promise.resolve([])),
    enabled: !!selectedOffenderName,
    staleTime: 0,
    refetchOnMount: "always",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="label-eyebrow">Intelligence & Surveillance Ledger</p>
          <h1 className="mt-1 font-display text-xl font-semibold text-base-100">Repeat Offender & Modus Operandi Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-signal-500/10 text-signal-400 border border-signal-500/20 px-3 py-1 font-bold text-xs uppercase tracking-wider">
            Live MySQL Ledger Active
          </Badge>
        </div>
      </div>

      {/* Top Stats Cards Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <Card className="p-3.5 border-base-800 shadow-glass bg-base-850">
          <div className="flex items-center justify-between">
            <span className="label-eyebrow text-[9px]">Repeat Offenders</span>
            <Users className="h-4 w-4 text-signal-500" />
          </div>
          <p className="mt-2 font-display text-xl font-extrabold text-base-100">
            {stats ? stats.totalRepeatOffenders : "..."}
          </p>
          <p className="text-[9px] text-base-500 font-semibold mt-0.5">&gt;1 Registered Case</p>
        </Card>

        <Card className="p-3.5 border-base-800 shadow-glass bg-base-850">
          <div className="flex items-center justify-between">
            <span className="label-eyebrow text-[9px]">Highest Risk Priority</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <p className="mt-2 font-display text-base font-extrabold text-red-400 truncate">
            {stats ? stats.highestRiskOffender.name : "..."}
          </p>
          <p className="text-[9px] text-base-500 font-semibold mt-0.5">
            Score: {stats ? stats.highestRiskOffender.score : 0}/100
          </p>
        </Card>

        <Card className="p-3.5 border-base-800 shadow-glass bg-base-850">
          <div className="flex items-center justify-between">
            <span className="label-eyebrow text-[9px]">Avg Crimes / Offender</span>
            <Layers className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 font-display text-xl font-extrabold text-base-100">
            {stats ? stats.avgCrimesPerOffender : "..."}
          </p>
          <p className="text-[9px] text-base-500 font-semibold mt-0.5">Offense Density</p>
        </Card>

        <Card className="p-3.5 border-base-800 shadow-glass bg-base-850">
          <div className="flex items-center justify-between">
            <span className="label-eyebrow text-[9px]">Top Crime Category</span>
            <Flame className="h-4 w-4 text-signal-500" />
          </div>
          <p className="mt-2 font-display text-base font-extrabold text-base-100 truncate">
            {stats ? stats.mostCommonCrimeType : "..."}
          </p>
          <p className="text-[9px] text-base-500 font-semibold mt-0.5">State Aggregate</p>
        </Card>

        <Card className="p-3.5 border-base-800 shadow-glass bg-base-850">
          <div className="flex items-center justify-between">
            <span className="label-eyebrow text-[9px]">Most Active District</span>
            <MapPin className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 font-display text-base font-extrabold text-base-100 truncate">
            {stats ? stats.mostActiveDistrict : "..."}
          </p>
          <p className="text-[9px] text-base-500 font-semibold mt-0.5">Jurisdiction Cluster</p>
        </Card>

        <Card className="p-3.5 border-base-800 shadow-glass bg-base-850">
          <div className="flex items-center justify-between">
            <span className="label-eyebrow text-[9px]">Dominant MO Method</span>
            <ShieldAlert className="h-4 w-4 text-purple-500" />
          </div>
          <p className="mt-2 font-display text-xs font-extrabold text-base-100 truncate">
            {stats ? stats.mostCommonMO : "..."}
          </p>
          <p className="text-[9px] text-base-500 font-semibold mt-0.5">Pattern Mode</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Left Panel: Repeat Offenders List with Multi-filters */}
        <div className="xl:col-span-1 space-y-4">
          <Card className="shadow-glass border-base-800 bg-base-850 flex flex-col h-[640px]">
            <CardHeader className="py-3 px-3.5 border-b border-base-800 bg-base-700/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-base-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-signal-500" />
                  REPEAT OFFENDERS ({offenders.length})
                </span>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-base-500" />
                <input
                  type="text"
                  placeholder="Search accused by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-base-950 border border-base-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-signal-500"
                />
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div>
                  <label className="text-base-500 font-bold block mb-0.5">District</label>
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="w-full bg-base-950 border border-base-800 rounded px-1.5 py-1 text-base-200 focus:outline-none"
                  >
                    {KARNATAKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-base-500 font-bold block mb-0.5">Crime Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full bg-base-950 border border-base-800 rounded px-1.5 py-1 text-base-200 focus:outline-none"
                  >
                    {CRIME_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className="text-base-400 font-bold flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-base-950 border border-base-800 rounded px-2 py-0.5 text-base-200 font-semibold focus:outline-none"
                >
                  <option value="repeat_count">Repeat Count</option>
                  <option value="risk_score">Risk Score</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </CardHeader>

            <CardContent className="pt-2 px-2 flex-1 overflow-y-auto space-y-1.5">
              {loadingList ? (
                <div className="text-xs text-base-500 p-8 text-center font-medium">Querying MySQL repeat ledger...</div>
              ) : isListError ? (
                <div className="text-xs text-red-400 p-6 text-center font-semibold bg-red-500/10 rounded-lg border border-red-500/20">
                  Unable to load repeat offenders from MySQL: {(listError as any)?.message || "Server Error"}
                </div>
              ) : offenders.length === 0 ? (
                <div className="text-xs text-base-400 p-8 text-center font-medium bg-base-900/50 rounded-lg border border-base-800">
                  No repeat offenders found matching the selected criteria.
                </div>
              ) : (
                offenders.map((o) => {
                  const isSelected = selectedOffenderName === o.name;
                  return (
                    <div
                      key={o.id}
                      onClick={() => setSelectedOffenderName(o.name)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-signal-500/15 border-signal-500 text-signal-400 font-bold shadow-md"
                          : "bg-base-900/60 border-base-800 text-base-200 hover:bg-base-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-base-100 truncate">{o.name}</p>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold shrink-0 ml-1 ${
                          o.riskScore >= 70
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>
                          Risk: {o.riskScore}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-base-400 mt-1 font-medium">
                        <span>{o.repeatCount} Crimes Registered</span>
                        <span className="truncate max-w-[110px]">{o.district}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center Panel: Offender Profile Card */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50 flex items-center justify-between">
              <span className="text-xs font-bold text-base-100 uppercase tracking-wider">
                OFFENDER PROFILE CARD
              </span>
              {profile && (
                <Badge className="bg-base-800 text-base-300 border border-base-700 text-[10px]">
                  {profile.district} District
                </Badge>
              )}
            </CardHeader>

            <CardContent className="pt-6">
              {loadingProfile ? (
                <div className="text-xs text-base-500 p-12 text-center font-medium">Fetching profile details...</div>
              ) : !profile ? (
                <div className="text-xs text-base-500 p-12 text-center font-medium">
                  Select a repeat offender from the directory list to load profile details.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Basic Details */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-signal-500/20 to-base-800 text-signal-400 flex items-center justify-center font-extrabold text-2xl border border-signal-500/30 shadow-md shrink-0">
                        {profile.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-lg font-extrabold text-base-100">{profile.name}</h2>
                        <p className="text-xs text-base-400 mt-0.5 font-medium">
                          Alias / Known As: <span className="font-bold text-base-200">{profile.aliases}</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs border-t border-base-800 pt-4">
                      <div>
                        <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Age / Gender</p>
                        <p className="text-base-200 mt-1 font-bold">{profile.age} Years / {profile.gender}</p>
                      </div>
                      <div>
                        <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Primary Jurisdiction</p>
                        <p className="text-base-200 mt-1 font-bold flex items-center gap-1 truncate">
                          <MapPin className="h-3.5 w-3.5 text-signal-500 shrink-0" />
                          {profile.policeStation}, {profile.district}
                        </p>
                      </div>
                      <div>
                        <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">First Recorded Offense</p>
                        <p className="text-base-200 mt-1 font-bold flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-base-400 shrink-0" />
                          {profile.firstOffense}
                        </p>
                      </div>
                      <div>
                        <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Latest Recorded Offense</p>
                        <p className="text-base-200 mt-1 font-bold flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-red-400 shrink-0" />
                          {profile.lastOffense}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-base-800 pt-3">
                      <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider mb-1.5">Tracked Crime Categories</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.crimeCategories.map((c, i) => (
                          <Badge key={i} className="bg-base-950 text-base-200 border border-base-800 text-[10px] font-semibold">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SVG Risk Score Gauge */}
                  <div className="flex flex-col items-center justify-center border-l border-base-800 pl-4">
                    <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider mb-4">Risk Priority Gauge</p>
                    
                    <div className="relative h-28 w-28">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-base-800"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={profile.riskScore >= 70 ? "text-red-500" : "text-amber-500"}
                          strokeDasharray={`${profile.riskScore}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center font-display">
                        <span className="text-2xl font-extrabold text-base-100">{profile.riskScore}</span>
                        <span className="text-[8px] text-base-500 uppercase tracking-widest font-bold">score</span>
                      </div>
                    </div>
                    
                    <Badge className={`mt-3 uppercase font-bold text-[9px] border px-2.5 py-0.5 rounded ${
                      profile.riskScore >= 70 
                        ? "bg-red-500/10 text-red-400 border-red-500/30" 
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}>
                      {profile.riskLevel} Priority
                    </Badge>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-center text-[10px] w-full pt-3 border-t border-base-800">
                      <div className="bg-base-950 p-1.5 rounded border border-base-800">
                        <span className="text-emerald-400 font-bold block text-sm">{profile.solvedCases}</span>
                        <span className="text-base-500 font-bold uppercase text-[8px]">Solved</span>
                      </div>
                      <div className="bg-base-950 p-1.5 rounded border border-base-800">
                        <span className="text-amber-400 font-bold block text-sm">{profile.pendingCases}</span>
                        <span className="text-base-500 font-bold uppercase text-[8px]">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Modus Operandi Panel */}
        <div>
          <Card className="h-full shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50 flex items-center justify-between">
              <span className="text-xs font-bold text-base-100 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-signal-500" />
                MODUS OPERANDI (MO)
              </span>
              {mo && (
                <span className="text-[10px] font-bold text-signal-400 bg-signal-500/10 px-2 py-0.5 rounded border border-signal-500/20">
                  {mo.moSimilarityScore}% Match
                </span>
              )}
            </CardHeader>

            <CardContent className="pt-5">
              {loadingMo ? (
                <div className="text-xs text-base-500 p-8 text-center font-medium">Aggregating MO from MySQL...</div>
              ) : !mo ? (
                <div className="text-xs text-base-500 p-8 text-center font-medium">No MO data available.</div>
              ) : (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Common Method / MO</p>
                    <p className="text-base-200 mt-1 font-semibold leading-relaxed bg-base-950 p-2 rounded border border-base-800 shadow-inner">
                      {mo.commonMethod}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-base-800 pt-3">
                    <div>
                      <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Active Time Window</p>
                      <p className="text-base-200 mt-1 font-semibold">{mo.commonTime}</p>
                    </div>
                    <div>
                      <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Preferred Targets</p>
                      <p className="text-base-200 mt-1 font-semibold">{mo.preferredTargets}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-base-800 pt-3">
                    <div>
                      <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Weapons Used</p>
                      <p className="text-base-200 mt-1 font-semibold">{mo.weaponsUsed}</p>
                    </div>
                    <div>
                      <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Escape Method</p>
                      <p className="text-base-200 mt-1 font-semibold">{mo.escapeMethod}</p>
                    </div>
                  </div>

                  <div className="border-t border-base-800 pt-3">
                    <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Crime Frequency</p>
                    <p className="text-signal-400 font-bold text-xs mt-0.5">{mo.crimeFrequency}</p>
                  </div>

                  <div className="border-t border-base-800 pt-3">
                    <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider mb-1 block">Behavioral Summary</p>
                    <p className="text-[11px] text-base-300 leading-relaxed bg-base-950/80 p-2.5 rounded border border-base-800">
                      {mo.behavioralSummary}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Panel: Chronological Offense Timeline */}
      <Card className="shadow-glass border-base-800 bg-base-850">
        <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50 flex items-center justify-between">
          <span className="text-xs font-bold text-base-100 uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-signal-500" />
            CHRONOLOGICAL OFFENSE TIMELINE ({timeline.length} CASES)
          </span>
          {selectedOffenderName && (
            <span className="text-xs font-bold text-base-300">
              Offender: <span className="text-signal-400">{selectedOffenderName}</span>
            </span>
          )}
        </CardHeader>

        <CardContent className="pt-4 pb-6">
          {loadingTimeline ? (
            <div className="text-xs text-base-500 p-8 text-center font-medium">Fetching chronological timeline from MySQL...</div>
          ) : timeline.length === 0 ? (
            <div className="text-xs text-base-500 p-8 text-center font-medium">No timeline cases found for selected offender.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-base-800 text-[10px] font-bold text-base-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Case ID</th>
                    <th className="py-2.5 px-3">FIR Number</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Crime Category</th>
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3">Police Station</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-800/60 font-medium">
                  {timeline.map((item) => (
                    <tr key={item.id} className="hover:bg-base-800/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-signal-400">{item.id}</td>
                      <td className="py-3 px-3 text-base-200">{item.fir}</td>
                      <td className="py-3 px-3 text-base-300 whitespace-nowrap">{item.date}</td>
                      <td className="py-3 px-3 font-bold text-base-100">{item.crimeType}</td>
                      <td className="py-3 px-3 text-base-300">{item.district}</td>
                      <td className="py-3 px-3 text-base-400">{item.station}</td>
                      <td className="py-3 px-3">
                        <Badge className={`text-[9px] font-extrabold uppercase px-2 py-0.5 border ${
                          item.status.toLowerCase() === "solved"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-base-200">
                        {item.severityScore}/100
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
