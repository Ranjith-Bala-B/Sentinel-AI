import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { CrimeCategoryPoint } from "@/shared/types/domain.types";

const COLORS = ["#1FD8C4", "#3C93F0", "#F0A93A", "#E5484D", "#7C6EF2", "#5EEAD4", "#94A3B8", "#465166"];

export function CrimeDistributionChart({ data }: { data: CrimeCategoryPoint[] }) {
  return (
    <Card className="shadow-sm border border-slate-200 bg-white p-0 overflow-hidden flex flex-col justify-between">
      <CardHeader className="border-b border-slate-100 p-4">
        <CardTitle className="text-sm font-bold text-slate-900">Crime distribution by category</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[210px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="category" innerRadius={50} outerRadius={78} paddingAngle={2}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: "#475569", lineHeight: "20px", fontWeight: 500 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
