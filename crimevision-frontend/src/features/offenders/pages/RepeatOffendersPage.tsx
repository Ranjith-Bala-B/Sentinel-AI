import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { apiClient } from "@/shared/lib/api-client";
import { Users, ShieldAlert, Clock, MapPin, Search } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";

interface OffenderListItem {
  id: string;
  name: string;
  casesCount: number;
  riskScore: number;
  riskLevel: string;
}

interface OffenderProfile {
  name: string;
  age: number;
  gender: string;
  aliases: string;
  address: string;
  firstOffense: string;
  lastOffense: string;
  riskScore: number;
  casesCount: number;
  modusOperandi: {
    commonMethod: string;
    commonTime: string;
    preferredTargets: string;
    weaponsUsed: string;
    escapeMethod: string;
    moSimilarityScore: number;
  };
  timeline: {
    id: string;
    fir: string;
    year: number;
    date: string;
    crimeType: string;
    station: string;
    status: string;
  }[];
}

export function RepeatOffendersPage() {
  const [offenders, setOffenders] = useState<OffenderListItem[]>([]);
  const [selectedOffenderName, setSelectedOffenderName] = useState<string>("");
  const [profile, setProfile] = useState<OffenderProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch Repeat Offenders List
  useEffect(() => {
    async function loadList() {
      try {
        setLoadingList(true);
        const data = await apiClient.get<OffenderListItem[]>("/offenders/repeat");
        setOffenders(data);
        if (data.length > 0) {
          setSelectedOffenderName(data[0].name);
        }
      } catch (err) {
        console.error("Error loading offenders list", err);
      } finally {
        setLoadingList(false);
      }
    }
    loadList();
  }, []);

  // Fetch Selected Offender Profile
  useEffect(() => {
    if (!selectedOffenderName) return;
    async function loadProfile() {
      try {
        setLoadingProfile(true);
        const data = await apiClient.get<OffenderProfile>(`/offenders/${selectedOffenderName}/profile`);
        setProfile(data);
      } catch (err) {
        console.error("Error loading offender profile", err);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, [selectedOffenderName]);

  const filteredOffenders = offenders.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="label-eyebrow">Offender Profiles</p>
        <h1 className="mt-1 font-display text-xl font-semibold text-base-100">Repeat Offender & Modus Operandi Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Left Panel: Repeat Offenders List */}
        <div className="xl:col-span-1">
          <Card className="h-full shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3.5 px-4 border-b border-base-800 bg-base-700/50 flex flex-col gap-2">
              <span className="text-xs font-bold text-base-100 uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4 text-signal-500" />
                REPEAT OFFENDERS
              </span>
              
              {/* Local Search input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-base-500" />
                <input
                  type="text"
                  placeholder="Search offender..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-base-950 border border-base-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-signal-500"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-3 px-2 overflow-y-auto max-h-[360px]">
              <div className="space-y-1.5">
                {loadingList ? (
                  <div className="text-xs text-base-500 p-4">Loading list...</div>
                ) : filteredOffenders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOffenderName(o.name)}
                    className={`flex items-center justify-between text-xs p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedOffenderName === o.name
                        ? "bg-signal-500/5 border-signal-500 text-signal-500 font-bold"
                        : "bg-base-850 border-base-800 text-base-200 hover:bg-base-750/30"
                    }`}
                  >
                    <div>
                      <p>{o.name}</p>
                      <p className="text-[10px] text-base-500 font-normal mt-0.5">{o.casesCount} Cases Tracked</p>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold ${
                      o.riskScore > 75 
                        ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}>
                      Score: {o.riskScore}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel: Offender Profile details */}
        <div className="xl:col-span-2">
          <Card className="h-full shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50">
              <span className="text-xs font-bold text-base-100 uppercase tracking-wider">
                OFFENDER PROFILE CARD
              </span>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingProfile || !profile ? (
                <div className="text-xs text-base-500 p-8 text-center">Fetching profile details...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Photo & Basic details */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar placeholder */}
                      <div className="h-16 w-16 rounded-lg bg-base-700 text-base-100 flex items-center justify-center font-extrabold text-xl border border-base-600 shadow-inner">
                        {profile.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-base-100">{profile.name}</h2>
                        <p className="text-xs text-base-500 mt-0.5">Known Aliases: <span className="font-semibold text-base-300">{profile.aliases}</span></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs border-t border-base-800 pt-4">
                      <div>
                        <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Age / Gender</p>
                        <p className="text-base-200 mt-1 font-semibold">{profile.age} Years / {profile.gender}</p>
                      </div>
                      <div>
                        <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Last Tracked Address</p>
                        <p className="text-base-200 mt-1 font-semibold flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-signal-500 shrink-0" />
                          {profile.address.split(",")[0]}
                        </p>
                      </div>
                      <div>
                        <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">First Offense</p>
                        <p className="text-base-200 mt-1 font-semibold flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-base-500 shrink-0" />
                          {profile.firstOffense}
                        </p>
                      </div>
                      <div>
                        <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Last Offense</p>
                        <p className="text-base-200 mt-1 font-semibold flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-alert-red shrink-0" />
                          {profile.lastOffense}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Circular Risk Score Gauge */}
                  <div className="flex flex-col items-center justify-center border-l border-base-800 pl-4">
                    <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider mb-4">Risk Priority Indicator</p>
                    
                    {/* SVG Gauge */}
                    <div className="relative h-24 w-24">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        {/* Background ring */}
                        <path
                          className="text-base-800"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        {/* Foreground ring */}
                        <path
                          className={profile.riskScore > 75 ? "text-alert-red" : "text-alert-amber"}
                          strokeDasharray={`${profile.riskScore}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      {/* Metric Center Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center font-display">
                        <span className="text-xl font-extrabold text-base-100">{profile.riskScore}</span>
                        <span className="text-[8px] text-base-500 uppercase tracking-widest font-bold">score</span>
                      </div>
                    </div>
                    
                    <Badge className={`mt-3.5 uppercase font-bold text-[9px] border px-2.5 py-0.5 rounded ${
                      profile.riskScore > 75 
                        ? "bg-red-500/10 text-red-500 border-red-500/20" 
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}>
                      {profile.riskScore > 75 ? "High Risk" : "Moderate Risk"}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Modus Operandi variables */}
        <div>
          <Card className="h-full shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50">
              <span className="text-xs font-bold text-base-100 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-signal-500" />
                MODUS OPERANDI (MO)
              </span>
            </CardHeader>
            <CardContent className="pt-5">
              {loadingProfile || !profile ? (
                <div className="text-xs text-base-500 p-8 text-center font-semibold">Loading variables...</div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Common Method</p>
                    <p className="text-base-200 mt-1 font-semibold leading-relaxed bg-base-950 p-2 rounded border border-base-800 shadow-inner">
                      {profile.modusOperandi.commonMethod}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-base-800 pt-3">
                    <div>
                      <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Common Time</p>
                      <p className="text-base-200 mt-1 font-semibold">{profile.modusOperandi.commonTime}</p>
                    </div>
                    <div>
                      <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Preferred Targets</p>
                      <p className="text-base-200 mt-1 font-semibold">{profile.modusOperandi.preferredTargets}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-base-800 pt-3">
                    <div>
                      <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Weapons Used</p>
                      <p className="text-base-200 mt-1 font-semibold">{profile.modusOperandi.weaponsUsed}</p>
                    </div>
                    <div>
                      <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Escape Method</p>
                      <p className="text-base-200 mt-1 font-semibold">{profile.modusOperandi.escapeMethod}</p>
                    </div>
                  </div>
                  <div className="border-t border-base-800 pt-3 flex items-center justify-between">
                    <span className="text-base-500 font-bold text-[9px] uppercase tracking-wider">MO Similarity Rate</span>
                    <span className="text-xs font-bold text-signal-500 bg-signal-500/5 px-2 py-0.5 rounded border border-signal-500/10">
                      {profile.modusOperandi.moSimilarityScore}% Matching
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Panel: Offense Timeline */}
      <Card className="shadow-glass border-base-800 bg-base-850">
        <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50">
          <span className="text-xs font-bold text-base-100 uppercase tracking-wider">
            OFFENSE TIMELINE CHRONOLOGY
          </span>
        </CardHeader>
        <CardContent className="pt-6 pb-8">
          {loadingProfile || !profile ? (
            <div className="text-xs text-base-500 p-8 text-center">Loading timeline...</div>
          ) : (
            <div className="relative px-6">
              {/* Horizontal line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-base-800 -translate-y-1/2 z-0" />
              
              <div className="relative flex justify-between items-center z-10">
                {profile.timeline.map((item, idx) => (
                  <div key={item.id} className="flex flex-col items-center group relative">
                    {/* Glowing Dot */}
                    <div className="h-7 w-7 rounded-full bg-signal-500 text-white flex items-center justify-center font-bold text-[10px] border-4 border-white shadow-md group-hover:scale-115 transition-transform">
                      {idx + 1}
                    </div>
                    {/* Timestamp label */}
                    <span className="text-xs font-extrabold text-base-100 mt-3">{item.year}</span>
                    <span className="text-[10px] text-base-500 font-medium mt-0.5">{item.date}</span>
                    
                    {/* Floating Info card on hover */}
                    <div className="absolute bottom-12 scale-0 group-hover:scale-100 bg-slate-900 border border-slate-800 text-white p-2.5 rounded-lg text-[10px] w-48 shadow-lg transition-all z-20 pointer-events-none">
                      <p className="font-extrabold text-blue-300">FIR: {item.fir}</p>
                      <p className="mt-1"><b>Type:</b> {item.crimeType}</p>
                      <p><b>Station:</b> {item.station}</p>
                      <p className="mt-1 uppercase text-blue-200"><b>Status:</b> {item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
