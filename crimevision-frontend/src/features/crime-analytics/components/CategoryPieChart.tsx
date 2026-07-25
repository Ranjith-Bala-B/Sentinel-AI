import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { CrimeAnalyticsResponse } from "@/features/crime-analytics/types/crime-analytics.types";

const COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#14B8A6", // teal
  "#6B7280", // gray
];

export function CategoryPieChart({ data }: { data: CrimeAnalyticsResponse["categoryBreakdown"] }) {
  return (
    <Card className="shadow-glass border-base-800">
      <CardHeader>
        <CardTitle className="text-xs font-bold text-base-100 uppercase tracking-wider">Crime Categories Share</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                nameKey="category"
                dataKey="count"
                cx="50%"
                cy="50%"
                outerRadius={75}
                innerRadius={45}
                paddingAngle={3}
                label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""}
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#10151D",
                  border: "1px solid #1D2531",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#fff"
                }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                formatter={(value) => <span className="text-[10px] font-semibold text-base-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
