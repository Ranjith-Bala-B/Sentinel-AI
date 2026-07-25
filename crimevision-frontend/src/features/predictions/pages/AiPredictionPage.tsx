import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { apiClient } from "@/shared/lib/api-client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { BrainCircuit, Cpu, Thermometer, ShieldCheck } from "lucide-react";

interface PredictionOverview {
  predictedCrimes30d: number;
  highRiskLocations: number;
  riskScore: number;
  confidenceLevel: number;
  insights: string[];
}

interface ForecastPoint {
  label: string;
  actual: number;
  predicted: number;
}

interface HeatmapCell {
  day: string;
  hour: string;
  risk: number;
}

export function AiPredictionPage() {
  const [overview, setOverview] = useState<PredictionOverview | null>(null);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPredictions() {
      try {
        setLoading(true);
        const [ov, fc, hm] = await Promise.all([
          apiClient.get<PredictionOverview>("/predictions/overview"),
          apiClient.get<ForecastPoint[]>("/predictions/forecast"),
          apiClient.get<HeatmapCell[]>("/predictions/heatmap")
        ]);
        setOverview(ov);
        setForecast(fc);
        setHeatmap(hm);
      } catch (err) {
        console.error("Error loading predictions", err);
      } finally {
        setLoading(false);
      }
    }
    loadPredictions();
  }, []);

  // Pie chart variables
  const categoryData = [
    { name: "Theft", value: 38 },
    { name: "Cybercrime", value: 26 },
    { name: "Burglary", value: 18 },
    { name: "Assault", value: 12 },
    { name: "Others", value: 6 }
  ];
  const PIE_COLORS = ["#2563EB", "#3B82F6", "#F59E0B", "#EF4444", "#94A3B8"];

  // Heatmap day and hour arrays
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];

  const getHeatmapColor = (val: number) => {
    if (val > 70) return "bg-red-500 text-white";
    if (val > 45) return "bg-amber-500 text-white";
    if (val > 25) return "bg-yellow-400 text-slate-800";
    return "bg-slate-100 text-slate-400";
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="label-eyebrow">Predictive Analytics</p>
        <h1 className="mt-1 font-display text-xl font-semibold text-base-100">AI Prediction & Risk Intelligence Dashboard</h1>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Predicted crimes (30 Days)", value: overview ? `${overview.predictedCrimes30d.toLocaleString()}` : "...", sub: "Based on seasonality", icon: <BrainCircuit className="h-4.5 w-4.5" /> },
          { label: "High-risk clusters", value: overview ? String(overview.highRiskLocations) : "...", sub: "District levels", icon: <Thermometer className="h-4.5 w-4.5" /> },
          { label: "Risk score index", value: overview ? `${overview.riskScore}/100` : "...", sub: "State aggregate", icon: <Cpu className="h-4.5 w-4.5" /> },
          { label: "Model confidence level", value: overview ? `${overview.confidenceLevel}%` : "...", sub: "F1 validation metric", icon: <ShieldCheck className="h-4.5 w-4.5" /> }
        ].map((k, idx) => (
          <Card key={idx} className="p-4 border-base-800 shadow-glass bg-base-850">
            <div className="flex items-center justify-between">
              <span className="label-eyebrow text-[10px]">{k.label}</span>
              <span className="rounded-md bg-signal-500/10 p-1.5 text-signal-500">{k.icon}</span>
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold text-base-100">{k.value}</p>
            <p className="text-[10px] text-base-500 font-semibold mt-1">{k.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Forecast Line Chart */}
        <div className="xl:col-span-2">
          <Card className="shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50">
              <span className="text-xs font-bold text-base-100 uppercase tracking-wider">
                6-Month Predictive Forecast Model
              </span>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-64 w-full">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-xs text-base-500">Calculating forecast model...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecast} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="actual" name="Actual Crimes" stroke="#64748B" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="predicted" name="AI Forecast" stroke="#2563EB" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Predicted Categories pie chart */}
        <Card className="shadow-glass border-base-800 bg-base-850">
          <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50">
            <span className="text-xs font-bold text-base-100 uppercase tracking-wider">
              Top Predicted Crime Categories
            </span>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col items-center justify-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={65}
                    paddingAngle={0}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Risk Heatmap Matrix */}
        <div className="xl:col-span-2">
          <Card className="shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50">
              <span className="text-xs font-bold text-base-100 uppercase tracking-wider">
                Risk Heatmap Index (Hour of Day vs Weekday)
              </span>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
              <div 
                style={{ display: "grid", gridTemplateColumns: "100px repeat(12, minmax(0, 1fr))" }} 
                className="min-w-[650px] gap-1.5 text-[10px] text-center font-bold text-base-400"
              >
                {/* Header spacing cell */}
                <div></div>
                {hours.map(h => (
                  <div key={h} className="text-center py-1 bg-base-700/50 border border-base-800 rounded font-bold text-base-300">{h}</div>
                ))}
                
                {/* Heatmap Row Cells */}
                {days.map(d => {
                  return (
                    <React.Fragment key={d}>
                      <div className="text-left font-extrabold text-base-200 py-2.5 pr-2 flex items-center">{d}</div>
                      {hours.map(h => {
                        const cell = heatmap.find(cell => cell.day === d && cell.hour === h);
                        const riskVal = cell ? cell.risk : 10;
                        return (
                          <div
                            key={`${d}-${h}`}
                            title={`${d} at ${h}: Risk Index ${riskVal}`}
                            className={`rounded py-2.5 font-extrabold shadow-inner flex items-center justify-center transition-all ${getHeatmapColor(riskVal)}`}
                          >
                            {riskVal}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
              
              {/* Heatmap Legend */}
              <div className="flex justify-end gap-3 text-[9px] font-bold text-base-500 mt-4 border-t border-base-800 pt-3">
                <div className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-slate-100" /> Low (0-25)</div>
                <div className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-yellow-400" /> Moderate (26-45)</div>
                <div className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-500" /> High (46-70)</div>
                <div className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-red-500" /> Severe (&gt;70)</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Predictions Natural Language Insights List */}
        <div>
          <Card className="h-full shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50">
              <span className="text-xs font-bold text-base-100 uppercase tracking-wider">
                AI PREDICTIVE INSIGHTS
              </span>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {loading || !overview ? (
                  <div className="text-xs text-base-500 p-4">Loading insights...</div>
                ) : (
                  overview.insights.map((insight, idx) => (
                    <div key={idx} className="flex gap-3 text-xs leading-relaxed text-base-300 bg-base-950 p-3 rounded-lg border border-base-800">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-signal-500 mt-1" />
                      <p>{insight}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
