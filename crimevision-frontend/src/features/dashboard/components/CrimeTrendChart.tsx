import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { TrendPoint } from "@/shared/types/domain.types";

export function CrimeTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Monthly crime trend</CardTitle>
          <p className="mt-1 text-xs text-base-400">Reported vs solved cases, last 12 months</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="crimesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E5484D" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#E5484D" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="solvedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1FD8C4" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#1FD8C4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1D2531" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#6B7A90", fontSize: 11 }} axisLine={{ stroke: "#1D2531" }} tickLine={false} />
              <YAxis tick={{ fill: "#6B7A90", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{
                  background: "#10151D",
                  border: "1px solid #1D2531",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#C2CBD8" }}
              />
              <Area type="monotone" dataKey="crimes" name="Reported" stroke="#E5484D" strokeWidth={2} fill="url(#crimesFill)" />
              <Area type="monotone" dataKey="solved" name="Solved" stroke="#1FD8C4" strokeWidth={2} fill="url(#solvedFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
