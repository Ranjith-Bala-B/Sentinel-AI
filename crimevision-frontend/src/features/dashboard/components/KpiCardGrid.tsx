import type { ReactNode } from "react";
import {
  ShieldAlert,
  Calendar,
  TrendingUp,
  ClipboardCheck,
  Repeat,
  MapPinned,
  Brain,
} from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/skeletons/skeleton";
import { formatNumber, formatPercent, cn } from "@/shared/lib/utils";
import type { KpiSummary } from "@/shared/types/domain.types";

interface KpiDef {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  icon: ReactNode;
}

function buildKpis(k: KpiSummary): KpiDef[] {
  return [
    {
      label: "Total Cases",
      value: formatNumber(k.totalCrimes),
      icon: <ShieldAlert className="h-4 w-4" />,
    },
    {
      label: "Crimes this month",
      value: formatNumber(k.crimesThisMonth),
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      label: "Crime rate change",
      value: k.crimeRateChange >= 0 ? `+${formatPercent(k.crimeRateChange, 1)}` : formatPercent(k.crimeRateChange, 1),
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      label: "Active investigations",
      value: formatNumber(k.activeInvestigations),
      icon: <ClipboardCheck className="h-4 w-4" />,
    },
    {
      label: "Repeat Offenders",
      value: formatNumber(k.repeatOffenders),
      icon: <Repeat className="h-4 w-4" />,
    },
    {
      label: "High Risk Areas",
      value: formatNumber(k.highRiskDistricts),
      icon: <MapPinned className="h-4 w-4" />,
    },
    {
      label: "AI Alerts",
      value: formatNumber(k.activeAlerts),
      icon: <Brain className="h-4 w-4" />,
    },
  ];
}

export function KpiCardGrid({ kpis }: { kpis: KpiSummary }) {
  const cards = buildKpis(kpis);
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {cards.map((c) => (
        <Card key={c.label} className="p-4">
          <div className="flex items-center justify-between">
            <span className="label-eyebrow">{c.label}</span>
            <span className="rounded-md bg-signal-500/10 p-1.5 text-signal-400">{c.icon}</span>
          </div>
          <p className="mt-3 font-display text-2xl font-semibold text-base-50">{c.value}</p>
          {c.delta && (
            <p
              className={cn(
                "mt-1 text-xs",
                c.deltaTone === "up" && "text-alert-red",
                c.deltaTone === "down" && "text-signal-400",
                c.deltaTone === "neutral" && "text-base-400"
              )}
            >
              {c.delta}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}

export function KpiCardGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-3 h-7 w-20" />
          <Skeleton className="mt-2 h-3 w-24" />
        </Card>
      ))}
    </div>
  );
}
