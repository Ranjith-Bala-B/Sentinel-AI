import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import type { CrimeAnalyticsResponse } from "@/features/crime-analytics/types/crime-analytics.types";

type Tab = "monthly" | "yearly";

export function TrendTabs({ data }: { data: CrimeAnalyticsResponse }) {
  const [tab, setTab] = useState<Tab>("monthly");

  const chartData = tab === "monthly"
    ? data.monthlyTrend.map((d) => ({ label: d.label, count: d.count }))
    : data.yearlyTrend.map((d) => ({ label: d.year, count: d.count }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crime trend</CardTitle>
        <div className="flex gap-1 rounded-lg bg-base-900/60 p-1">
          {(["monthly", "yearly"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-3 py-1 text-xs capitalize transition-colors",
                tab === t ? "bg-signal-500/15 text-signal-300" : "text-base-400 hover:text-base-200"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1D2531" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#6B7A90", fontSize: 11 }} axisLine={{ stroke: "#1D2531" }} tickLine={false} />
              <YAxis tick={{ fill: "#6B7A90", fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
              <Tooltip contentStyle={{ background: "#10151D", border: "1px solid #1D2531", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#1FD8C4" strokeWidth={2} dot={{ r: 3, fill: "#1FD8C4" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
