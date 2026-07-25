import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { CrimeAnalyticsResponse } from "@/features/crime-analytics/types/crime-analytics.types";

const tooltipStyle = { background: "#10151D", border: "1px solid #1D2531", borderRadius: 8, fontSize: 12 };

export function TimeOfDayChart({ data }: { data: CrimeAnalyticsResponse["timeOfDay"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Time-of-day analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1D2531" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: "#6B7A90", fontSize: 10 }} axisLine={{ stroke: "#1D2531" }} tickLine={false} />
              <YAxis tick={{ fill: "#6B7A90", fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" fill="#F0A93A" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeekdayChart({ data }: { data: CrimeAnalyticsResponse["weekday"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekday analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1D2531" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#6B7A90", fontSize: 11 }} axisLine={{ stroke: "#1D2531" }} tickLine={false} />
              <YAxis tick={{ fill: "#6B7A90", fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" fill="#7C6EF2" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function SeasonalRadarChart({ data }: { data: CrimeAnalyticsResponse["seasonal"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seasonal analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="#1D2531" />
              <PolarAngleAxis dataKey="season" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: "#465166", fontSize: 9 }} axisLine={false} />
              <Radar dataKey="count" stroke="#1FD8C4" fill="#1FD8C4" fillOpacity={0.25} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
