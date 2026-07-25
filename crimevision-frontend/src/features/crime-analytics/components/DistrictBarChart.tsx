import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { DistrictComparisonPoint } from "@/features/crime-analytics/types/crime-analytics.types";

export function DistrictBarChart({ data }: { data: DistrictComparisonPoint[] }) {
  return (
    <Card className="shadow-glass border-base-800">
      <CardHeader>
        <CardTitle className="text-xs font-bold text-base-100 uppercase tracking-wider">District Case Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1D2531" vertical={false} />
              <XAxis 
                dataKey="district" 
                tick={{ fill: "#6B7A90", fontSize: 10 }} 
                axisLine={{ stroke: "#1D2531" }} 
                tickLine={false} 
                interval={0} 
                angle={-20} 
                textAnchor="end" 
                height={50} 
              />
              <YAxis tick={{ fill: "#6B7A90", fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
              <Tooltip 
                contentStyle={{ 
                  background: "#10151D", 
                  border: "1px solid #1D2531", 
                  borderRadius: 8, 
                  fontSize: 12,
                  color: "#fff"
                }} 
                cursor={{ fill: "rgba(255,255,255,0.03)" }} 
              />
              <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
