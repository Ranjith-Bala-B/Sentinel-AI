import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { formatNumber } from "@/shared/lib/utils";
import type { StationRankPoint } from "@/shared/types/domain.types";

function toneForRate(rate: number): "signal" | "amber" | "red" {
  if (rate >= 65) return "signal";
  if (rate >= 55) return "amber";
  return "red";
}

export function TopStationsTable({ data }: { data: StationRankPoint[] }) {
  return (
    <Card className="h-[310px] max-h-[310px] flex flex-col justify-between shadow-sm border border-slate-200 bg-white p-0 overflow-hidden">
      <CardHeader className="border-b border-slate-100 p-4 shrink-0">
        <CardTitle className="text-sm font-bold text-slate-900">Top police stations by caseload</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-y-auto flex-1 scrollbar-thin">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-500 bg-slate-50/80">
                <th className="px-4 py-2.5 font-semibold">Station</th>
                <th className="px-4 py-2.5 font-semibold">District</th>
                <th className="px-4 py-2.5 font-semibold">Caseload</th>
                <th className="px-4 py-2.5 font-semibold">Solve rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((s) => (
                <tr key={s.station} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{s.station}</td>
                  <td className="px-4 py-2.5 text-slate-600 font-medium">{s.district}</td>
                  <td className="px-4 py-2.5 font-semibold text-slate-800">{formatNumber(s.caseload)}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={toneForRate(s.solvedRate)} className="font-bold text-[10px] px-2 py-0.5">{s.solvedRate}%</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
