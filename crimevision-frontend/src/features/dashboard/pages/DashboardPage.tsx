import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardSummary";
import { KpiCardGrid, KpiCardGridSkeleton } from "@/features/dashboard/components/KpiCardGrid";
import { CrimeTrendChart } from "@/features/dashboard/components/CrimeTrendChart";
import { CrimeDistributionChart } from "@/features/dashboard/components/CrimeDistributionChart";
import { DistrictRankingChart } from "@/features/dashboard/components/DistrictRankingChart";
import { TopStationsTable } from "@/features/dashboard/components/TopStationsTable";
import { LiveIntelligenceFeed } from "@/features/dashboard/components/LiveIntelligenceFeed";
import { CaseStatusChart } from "@/features/dashboard/components/CaseStatusChart";
import { Skeleton } from "@/shared/components/skeletons/skeleton";
import { ErrorBoundary } from "@/shared/components/error-boundary";

export function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardSummary();

  if (isError) {
    const errMsg = error instanceof Error ? error.message : "Unable to connect to local FastAPI backend on http://localhost:8000";
    return (
      <div className="rounded-xl2 border border-alert-red/30 bg-alert-red/5 p-8 text-center text-sm text-alert-red">
        <p className="font-semibold">Failed to load dashboard summary</p>
        <p className="mt-1 text-xs opacity-90">{errMsg}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="label-eyebrow">State overview</p>
        <h1 className="mt-1 font-display text-xl font-semibold text-base-50">Command dashboard</h1>
      </div>

      {isLoading || !data ? <KpiCardGridSkeleton /> : <KpiCardGrid kpis={data.kpis} />}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 items-stretch">
        {/* Left 2 Columns */}
        <div className="space-y-6 xl:col-span-2 flex flex-col">
          <ErrorBoundary>
            {isLoading || !data ? (
              <Skeleton className="h-80 w-full rounded-xl2" />
            ) : (
              <CrimeTrendChart data={data.monthlyTrend} />
            )}
          </ErrorBoundary>

          <ErrorBoundary>
            {isLoading || !data ? (
              <Skeleton className="h-64 w-full rounded-xl2" />
            ) : (
              <LiveIntelligenceFeed items={data.feed} />
            )}
          </ErrorBoundary>

          <ErrorBoundary>
            {isLoading || !data ? (
              <Skeleton className="h-64 w-full rounded-xl2" />
            ) : (
              <TopStationsTable data={data.topStations} />
            )}
          </ErrorBoundary>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6 xl:col-span-1 flex flex-col">
          <ErrorBoundary>
            {isLoading || !data ? (
              <Skeleton className="h-72 w-full rounded-xl2" />
            ) : (
              <CrimeDistributionChart data={data.crimeByCategory} />
            )}
          </ErrorBoundary>

          <ErrorBoundary>
            {isLoading || !data ? (
              <Skeleton className="h-80 w-full rounded-xl2" />
            ) : (
              <DistrictRankingChart data={data.districtRanking} />
            )}
          </ErrorBoundary>

          <ErrorBoundary>
            {isLoading || !data ? (
              <Skeleton className="h-[310px] w-full rounded-xl2" />
            ) : (
              <CaseStatusChart data={data.statusBreakdown} />
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
