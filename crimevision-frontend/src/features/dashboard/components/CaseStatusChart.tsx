import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { StatusPoint } from "@/shared/types/domain.types";
import { CheckCircle2, Clock, FolderCheck, FolderOpen } from "lucide-react";

interface CaseStatusChartProps {
  data?: StatusPoint[];
}

export function CaseStatusChart({ data }: CaseStatusChartProps) {
  // Default values if data isn't loaded yet
  const defaultStatus: StatusPoint[] = [
    { status: "Open", count: 12, percentage: 30.0 },
    { status: "Pending", count: 8, percentage: 20.0 },
    { status: "Solved", count: 16, percentage: 40.0 },
    { status: "Closed", count: 4, percentage: 10.0 },
  ];

  const items = data && data.length > 0 ? data : defaultStatus;

  // 4 Menu Bar Blue Gradient Colors (Darkest to Lightest)
  const STATUS_CONFIG: Record<
    string,
    {
      bgClass: string;
      borderClass: string;
      textClass: string;
      barColor: string;
      icon: any;
    }
  > = {
    Open: {
      bgClass: "bg-base-900", // Darkest Menu Bar Deep Blue (#0F3DA3)
      borderClass: "border-blue-900",
      textClass: "text-white",
      barColor: "#0F3DA3",
      icon: FolderOpen,
    },
    Pending: {
      bgClass: "bg-blue-700", // Medium Royal Blue
      borderClass: "border-blue-600",
      textClass: "text-white",
      barColor: "#1D4ED8",
      icon: Clock,
    },
    Solved: {
      bgClass: "bg-blue-500", // Medium Light Blue
      borderClass: "border-blue-400",
      textClass: "text-white",
      barColor: "#3B82F6",
      icon: CheckCircle2,
    },
    Closed: {
      bgClass: "bg-blue-300 text-blue-950", // Light Ice Blue
      borderClass: "border-blue-200",
      textClass: "text-blue-950",
      barColor: "#93C5FD",
      icon: FolderCheck,
    },
  };

  const totalCount = items.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="h-[310px] max-h-[310px] flex flex-col justify-between shadow-sm border border-slate-200 bg-white p-0 overflow-hidden">
      <CardHeader className="border-b border-slate-100 p-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">Case status breakdown</CardTitle>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Total recorded cases: <span className="font-bold text-slate-800">{totalCount}</span>
            </p>
          </div>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
            Realtime
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        {/* Multi-segment Gradient Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <span>Status Distribution</span>
            <span>100%</span>
          </div>
          <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
            {items.map((item) => {
              const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG["Open"];
              return (
                <div
                  key={item.status}
                  style={{
                    width: `${Math.max(item.percentage, 3)}%`,
                    backgroundColor: cfg.barColor,
                  }}
                  className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                  title={`${item.status}: ${item.percentage}% (${item.count} cases)`}
                />
              );
            })}
          </div>
        </div>

        {/* 4 Status Cards in Menu Bar Blues */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {items.map((item) => {
            const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG["Open"];
            const Icon = cfg.icon;
            return (
              <div
                key={item.status}
                className={`flex flex-col justify-between p-2.5 rounded-xl border ${cfg.bgClass} ${cfg.borderClass} ${cfg.textClass} shadow-sm transition-transform hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 opacity-90" />
                    <span className="text-xs font-bold">{item.status}</span>
                  </div>
                  <span className="text-[11px] font-extrabold opacity-95">
                    {item.percentage}%
                  </span>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-xs font-medium opacity-80">
                    {item.count} {item.count === 1 ? "case" : "cases"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
