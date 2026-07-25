import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import type { CrimeAnalyticsResponse } from "@/features/crime-analytics/types/crime-analytics.types";

const tooltipStyle = { background: "#10151D", border: "1px solid #1D2531", borderRadius: 8, fontSize: 12 };
const GENDER_COLORS = ["#3C93F0", "#E5484D", "#F0A93A"];

export function VictimAnalysisPanel({
  byAge,
  byGender,
}: {
  byAge: CrimeAnalyticsResponse["victimByAge"];
  byGender: CrimeAnalyticsResponse["victimByGender"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Victim analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-52 w-full">
            <p className="mb-1 text-[11px] text-base-500">By age group</p>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={byAge} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D2531" vertical={false} />
                <XAxis dataKey="ageGroup" tick={{ fill: "#6B7A90", fontSize: 10 }} axisLine={{ stroke: "#1D2531" }} tickLine={false} />
                <YAxis tick={{ fill: "#6B7A90", fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="count" fill="#5EEAD4" radius={[6, 6, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-52 w-full">
            <p className="mb-1 text-[11px] text-base-500">By gender</p>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={byGender} dataKey="count" nameKey="gender" innerRadius={40} outerRadius={64} paddingAngle={2}>
                  {byGender.map((_, i) => (
                    <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} stroke="#0C1017" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function OffenderAnalysisPanel({
  byAge,
  repeatOffenderRate,
}: {
  byAge: CrimeAnalyticsResponse["offenderByAge"];
  repeatOffenderRate: number;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Offender analysis</CardTitle>
        </div>
        <Badge tone="amber">{repeatOffenderRate}% repeat offenders</Badge>
      </CardHeader>
      <CardContent>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byAge} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1D2531" vertical={false} />
              <XAxis dataKey="ageGroup" tick={{ fill: "#6B7A90", fontSize: 10 }} axisLine={{ stroke: "#1D2531" }} tickLine={false} />
              <YAxis tick={{ fill: "#6B7A90", fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" fill="#E5484D" radius={[6, 6, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
