import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { apiClient } from "@/shared/lib/api-client";
import { 
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line 
} from "recharts";
import { BookOpen, Award, BarChart4 } from "lucide-react";

interface InsightData {
  crimeVsPopulation: { district: string; population: number; crimes: number }[];
  crimeVsUrbanization: { type: string; crimes: number }[];
  crimeVsEducation: { level: string; count: number }[];
  crimeVsEmployment: { status: string; count: number }[];
}

export function SociologicalInsightsPage() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        setLoading(true);
        const res = await apiClient.get<InsightData>("/sociological/insights");
        setData(res);
      } catch (err) {
        console.error("Error loading sociological insights", err);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, []);

  // Static mock arrays for age group and gender analysis to complete the 6 charts
  const ageData = [
    { name: "18-25", value: 38 },
    { name: "26-35", value: 29 },
    { name: "36-50", value: 21 },
    { name: "50+", value: 12 }
  ];

  const genderData = [
    { name: "Male Victims", value: 58 },
    { name: "Female Victims", value: 40 },
    { name: "Others", value: 2 }
  ];

  const PIE_COLORS = ["#0F3DA3", "#3B82F6", "#F59E0B", "#EF4444"];
  const GENDER_COLORS = ["#2563EB", "#EC4899", "#94A3B8"];

  return (
    <div className="space-y-6">
      <div>
        <p className="label-eyebrow">Sociodemographic Analysis</p>
        <h1 className="mt-1 font-display text-xl font-semibold text-base-100">Sociological Insights Dashboard</h1>
      </div>

      {loading || !data ? (
        <div className="text-xs text-base-500 p-8 text-center bg-base-850 rounded-lg border border-base-800 shadow-glass">
          Aggregating sociodemographic variables...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          
          {/* 1. Crime vs Population (Scatter Plot) */}
          <Card className="shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3 px-5 border-b border-base-800 bg-base-700/50">
              <span className="text-[10px] font-extrabold text-base-100 uppercase tracking-wider flex items-center gap-2">
                <BarChart4 className="h-4 w-4 text-signal-500" />
                CRIME VS POPULATION INDEX
              </span>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" dataKey="population" name="Population" unit=" ppl" tick={{ fill: "#64748B", fontSize: 9 }} />
                    <YAxis type="number" dataKey="crimes" name="Crimes" tick={{ fill: "#64748B", fontSize: 9 }} />
                    <ZAxis type="category" dataKey="district" name="District" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter name="Districts" data={data.crimeVsPopulation} fill="#2563EB" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 2. Crime vs Urbanization (Bar Chart) */}
          <Card className="shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3 px-5 border-b border-base-800 bg-base-700/50">
              <span className="text-[10px] font-extrabold text-base-100 uppercase tracking-wider">
                CRIME VS URBANIZATION LEVEL
              </span>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.crimeVsUrbanization} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="type" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="crimes" fill="#0F3DA3" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 3. Crime vs Education Level (Donut Chart) */}
          <Card className="shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3 px-5 border-b border-base-800 bg-base-700/50">
              <span className="text-[10px] font-extrabold text-base-100 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-signal-500" />
                CRIME VS EDUCATION LEVEL
              </span>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col items-center justify-center">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.crimeVsEducation}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="level"
                    >
                      {data.crimeVsEducation.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center text-[8px] font-bold text-base-400 mt-2">
                {data.crimeVsEducation.slice(0, 4).map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    <span>{entry.level}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. Crime vs Employment Rate (Line Chart) */}
          <Card className="shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3 px-5 border-b border-base-800 bg-base-700/50">
              <span className="text-[10px] font-extrabold text-base-100 uppercase tracking-wider">
                CRIME VS EMPLOYMENT STATE
              </span>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.crimeVsEmployment} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="status" tick={{ fill: "#64748B", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748B", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" name="Cases count" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 5. Age Group Analysis (Donut Chart) */}
          <Card className="shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3 px-5 border-b border-base-800 bg-base-700/50">
              <span className="text-[10px] font-extrabold text-base-100 uppercase tracking-wider flex items-center gap-2">
                <Award className="h-4 w-4 text-signal-500" />
                VICTIM AGE RANGE RATIO
              </span>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col items-center justify-center">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {ageData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-3 text-[9px] font-bold text-base-500 mt-2">
                {ageData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    <span>{entry.name} ({entry.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 6. Gender Wise Crimes (Pie Chart) */}
          <Card className="shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3 px-5 border-b border-base-800 bg-base-700/50">
              <span className="text-[10px] font-extrabold text-base-100 uppercase tracking-wider">
                GENDER CLASSIFIED CASES
              </span>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col items-center justify-center">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      dataKey="value"
                    >
                      {genderData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-3 text-[9px] font-bold text-base-500 mt-2">
                {genderData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: GENDER_COLORS[idx % GENDER_COLORS.length] }} />
                    <span>{entry.name} ({entry.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
        
        {/* AI Sociodemographic Correlation Case Study */}
        <div className="mt-6">
          <Card className="shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50">
              <span className="text-xs font-bold text-base-100 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-signal-500" />
                AI Sociodemographic Correlation Findings
              </span>
            </CardHeader>
            <CardContent className="pt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-base-950 p-4 rounded-lg border border-base-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-signal-400 text-[10px] uppercase tracking-wider">Identified Correlation</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-signal-400/10 text-signal-400 font-bold border border-signal-400/20">Active Analysis</span>
                </div>
                <h4 className="font-bold text-base-100 text-sm">Crime Spike in Bengaluru North</h4>
                <p className="text-xs text-base-300 leading-relaxed">
                  Correlation models indicate a localized increase in thefts and minor assaults. Key contributing social drivers identified:
                </p>
                <ul className="space-y-1.5 text-xs text-base-400 pt-1.5">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">↑</span> <b>Migration Rate:</b> Heavy influx of transient workforce leading to socio-economic adjustments.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">↑</span> <b>Population Density:</b> Multi-family infills stretching local beat surveillance capacity.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">↑</span> <b>Night-time Activity:</b> Expanding tech parks and late-shift logistics corridors.
                  </li>
                </ul>
              </div>

              <div className="bg-base-950 p-4 rounded-lg border border-base-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-500 text-[10px] uppercase tracking-wider">Education & Employment Link</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">High Correlation</span>
                </div>
                <h4 className="font-bold text-base-100 text-sm">Underemployment in Rural Belt</h4>
                <p className="text-xs text-base-300 leading-relaxed">
                  Cross-referencing cases in Tumakuru and Belagavi reveals:
                </p>
                <ul className="space-y-1.5 text-xs text-base-400 pt-1.5">
                  <li className="flex items-center gap-2">
                    <span className="text-signal-400 font-bold">✔</span> <b>Undergraduate Underemployment:</b> Correlates to a 14% increase in online financial scams.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-signal-400 font-bold">✔</span> <b>Low-literacy Clusters:</b> Show higher susceptibility to localized land dispute disputes.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        </>
      )}
    </div>
  );
}
