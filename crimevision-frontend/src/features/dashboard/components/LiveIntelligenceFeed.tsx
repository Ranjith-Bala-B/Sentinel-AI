import { Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import type { FeedItem } from "@/shared/types/domain.types";

const SEVERITY_TONE: Record<FeedItem["severity"], "signal" | "amber" | "red" | "blue"> = {
  low: "signal",
  moderate: "blue",
  high: "amber",
  critical: "red",
};

export function LiveIntelligenceFeed({ items }: { items: FeedItem[] }) {
  return (
    <Card className="flex flex-col p-0 overflow-hidden shadow-sm border border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-100 p-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">Live intelligence feed</CardTitle>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time incident & FIR feed</p>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-signal-400 bg-signal-400/10 px-2.5 py-1 rounded-full border border-signal-400/20">
            <Radio className="h-3 w-3 animate-pulse" />
            Live ({items.length})
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2.5 max-h-[235px] overflow-y-auto scrollbar-thin">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition-all hover:border-signal-500/40 hover:bg-blue-50/50 shadow-sm flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold leading-snug text-slate-900 truncate">{item.title}</p>
                <Badge tone={SEVERITY_TONE[item.severity]} className="shrink-0 capitalize font-bold text-[10px] px-2 py-0.5">
                  {item.severity}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                <span>Location: {item.district}</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-600 font-medium shrink-0 bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
              {item.timestamp}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
