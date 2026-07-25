import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import type { DistrictRankPoint } from "@/shared/types/domain.types";
import { Eye, MapPin, X, ShieldAlert, FolderCheck, CheckCircle2, Clock, FolderOpen, Layers } from "lucide-react";

const RISK_BADGE_STYLE: Record<DistrictRankPoint["riskLevel"], string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  moderate: "bg-blue-50 text-blue-700 border-blue-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function DistrictRankingChart({ data }: { data: DistrictRankPoint[] }) {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictRankPoint | null>(null);

  // Sort districts from higher complaints to lower
  const sortedDistricts = [...data].sort((a, b) => b.count - a.count);

  return (
    <>
      <Card className="h-[385px] max-h-[385px] shadow-sm border border-slate-200 bg-white flex flex-col p-0 overflow-hidden">
        <CardHeader className="border-b border-slate-100 p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">District ranking</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500 font-medium">
                Sorted by higher to lower complaint volume
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              {sortedDistricts.length} Districts
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-3.5 space-y-2 max-h-[320px] overflow-y-auto scrollbar-thin flex-1">
          {sortedDistricts.map((item, index) => {
            const rank = index + 1;
            return (
              <div
                key={item.district}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-blue-50/40 hover:border-blue-200 transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Badge */}
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${
                      rank === 1
                        ? "bg-amber-500 text-white shadow-2xs"
                        : rank === 2
                        ? "bg-slate-400 text-white"
                        : rank === 3
                        ? "bg-amber-700 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    #{rank}
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-900">
                      {item.district}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-medium text-slate-500">
                        {item.count} {item.count === 1 ? "complaint" : "complaints"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      RISK_BADGE_STYLE[item.riskLevel]
                    }`}
                  >
                    {item.riskLevel}
                  </span>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedDistrict(item)}
                    className="h-7 px-2 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                  >
                    <Eye className="h-3 w-3 mr-1 text-blue-600" />
                    Details
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* District Case Details Modal */}
      {selectedDistrict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/30 border border-blue-500/30 text-blue-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedDistrict.district}</h3>
                  <p className="text-xs text-slate-400 font-medium">District Case & Severity Analysis</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDistrict(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Top Overview Bar */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/80 border border-blue-200/80">
                <div>
                  <p className="text-xs text-blue-900 font-semibold">Total District Complaints</p>
                  <p className="text-2xl font-extrabold text-blue-950 mt-0.5">{selectedDistrict.count}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-900 font-semibold mb-1">Assessed Risk</p>
                  <span
                    className={`text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      RISK_BADGE_STYLE[selectedDistrict.riskLevel]
                    }`}
                  >
                    {selectedDistrict.riskLevel} Priority
                  </span>
                </div>
              </div>

              {/* Priority / Severity Number of Cases */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-blue-700" />
                    Priority Level Breakdown
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">Cases</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <p className="text-[11px] font-bold text-emerald-900">Low Priority</p>
                    <p className="text-lg font-extrabold text-emerald-950 mt-1">
                      {selectedDistrict.lowCount ?? Math.round(selectedDistrict.count * 0.25)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50">
                    <p className="text-[11px] font-bold text-blue-900">Moderate Priority</p>
                    <p className="text-lg font-extrabold text-blue-950 mt-1">
                      {selectedDistrict.moderateCount ?? Math.round(selectedDistrict.count * 0.35)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
                    <p className="text-[11px] font-bold text-amber-900">High Priority</p>
                    <p className="text-lg font-extrabold text-amber-950 mt-1">
                      {selectedDistrict.highCount ?? Math.round(selectedDistrict.count * 0.25)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50">
                    <p className="text-[11px] font-bold text-rose-900">Critical Priority</p>
                    <p className="text-lg font-extrabold text-rose-950 mt-1">
                      {selectedDistrict.criticalCount ?? Math.round(selectedDistrict.count * 0.15)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Breakdown (Open, Pending, Solved, Closed) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-blue-700" />
                    Status Case Breakdown
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">Cases</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl border border-base-900/30 bg-base-900 text-white">
                    <div className="flex items-center gap-1.5">
                      <FolderOpen className="h-3.5 w-3.5 text-blue-300" />
                      <p className="text-[11px] font-bold text-blue-100">Open Cases</p>
                    </div>
                    <p className="text-lg font-extrabold text-white mt-1">
                      {selectedDistrict.openCount ?? Math.round(selectedDistrict.count * 0.3)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-blue-700/40 bg-blue-700 text-white">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-200" />
                      <p className="text-[11px] font-bold text-blue-100">Pending Cases</p>
                    </div>
                    <p className="text-lg font-extrabold text-white mt-1">
                      {selectedDistrict.pendingCount ?? Math.round(selectedDistrict.count * 0.2)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-blue-500/40 bg-blue-500 text-white">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      <p className="text-[11px] font-bold text-blue-50">Solved Cases</p>
                    </div>
                    <p className="text-lg font-extrabold text-white mt-1">
                      {selectedDistrict.solvedCount ?? Math.round(selectedDistrict.count * 0.4)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-blue-300 bg-blue-300 text-blue-950">
                    <div className="flex items-center gap-1.5">
                      <FolderCheck className="h-3.5 w-3.5 text-blue-950" />
                      <p className="text-[11px] font-bold text-blue-950">Closed Cases</p>
                    </div>
                    <p className="text-lg font-extrabold text-blue-950 mt-1">
                      {selectedDistrict.closedCount ?? Math.round(selectedDistrict.count * 0.1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-right">
              <Button
                variant="secondary"
                onClick={() => setSelectedDistrict(null)}
                className="h-8 px-4 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100"
              >
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
