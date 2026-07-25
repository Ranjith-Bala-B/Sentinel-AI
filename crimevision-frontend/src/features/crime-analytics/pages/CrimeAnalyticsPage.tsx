import { useState } from "react";
import { useCrimeAnalytics, useFilterOptions } from "@/features/crime-analytics/hooks/useCrimeAnalytics";
import { FilterPanel } from "@/features/crime-analytics/components/FilterPanel";
import { CrimeRecordsTable } from "@/features/crime-analytics/components/CrimeRecordsTable";
import { TrendTabs } from "@/features/crime-analytics/components/TrendTabs";
import { CategoryPieChart } from "@/features/crime-analytics/components/CategoryPieChart";
import { DistrictBarChart } from "@/features/crime-analytics/components/DistrictBarChart";
import { StationBarChart } from "@/features/crime-analytics/components/StationBarChart";
import { TimeOfDayChart } from "@/features/crime-analytics/components/TimeSeasonalWeekdayPanels";
import { VictimAnalysisPanel, OffenderAnalysisPanel } from "@/features/crime-analytics/components/VictimOffenderPanels";
import { Skeleton } from "@/shared/components/skeletons/skeleton";
import { ErrorBoundary } from "@/shared/components/error-boundary";
import { AlertTriangle, RotateCcw } from "lucide-react";
import type { CrimeFilters } from "@/features/crime-analytics/types/crime-analytics.types";

export function CrimeAnalyticsPage() {
  const [filters, setFormData] = useState<CrimeFilters>({});
  const { data: options, isLoading: isLoadingOptions } = useFilterOptions();
  const { data, isLoading, isError } = useCrimeAnalytics(filters);

  function patchFilters(patch: Partial<CrimeFilters>) {
    setFormData((prev) => ({ ...prev, ...patch }));
  }

  const totalCount = data
    ? (data.records !== undefined
        ? data.records.length
        : data.monthlyTrend.reduce((acc, curr) => acc + curr.count, 0))
    : 0;

  const hasNoData = data && totalCount === 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="label-eyebrow">Deep-dive analytics</p>
        <h1 className="mt-1 font-display text-xl font-semibold text-base-50">Crime analytics</h1>
      </div>

      <FilterPanel
        filters={filters}
        options={options}
        isLoadingOptions={isLoadingOptions}
        onChange={patchFilters}
        onReset={() => setFormData({})}
      />

      {isError && (
        <div className="rounded-xl2 border border-alert-red/30 bg-alert-red/5 p-6 text-sm text-alert-red">
          Failed to load analytics for the current filters. Check crime-service logs.
        </div>
      )}

      {!isLoading && hasNoData ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-amber-300 bg-amber-50/80 rounded-2xl shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 border border-amber-300 mb-4">
            <AlertTriangle className="h-7 w-7 text-amber-600" />
          </div>
          <h3 className="text-base-900 font-bold text-lg">Warning: No Crime Record Found</h3>
          <p className="text-sm text-base-600 mt-2 max-w-md">
            There are no recorded crime incidents matching your active filters:
            <span className="block mt-2 font-mono text-xs text-amber-900 bg-amber-100/70 p-2.5 rounded border border-amber-300 font-semibold">
              District: "{filters.district || 'All Districts'}" | Crime Type: "{filters.crimeType || 'All Types'}" | Station: "{filters.station || 'All Stations'}"
            </span>
          </p>
          <button
            onClick={() => setFormData({})}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-signal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-signal-700 transition-colors shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset All Filters
          </button>
        </div>

      ) : (
        <>
          <ErrorBoundary>
            {isLoading || !data ? (
              <Skeleton className="h-64 w-full rounded-xl2" />
            ) : (
              <CrimeRecordsTable records={data.records || []} />
            )}
          </ErrorBoundary>

          <ErrorBoundary>
            {isLoading || !data ? <Skeleton className="h-80 w-full rounded-xl2" /> : <TrendTabs data={data} />}
          </ErrorBoundary>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ErrorBoundary>
              {isLoading || !data ? <Skeleton className="h-80 w-full rounded-xl2" /> : <CategoryPieChart data={data.categoryBreakdown} />}
            </ErrorBoundary>
            <ErrorBoundary>
              {isLoading || !data ? <Skeleton className="h-80 w-full rounded-xl2" /> : <DistrictBarChart data={data.districtComparison} />}
            </ErrorBoundary>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ErrorBoundary>
              {isLoading || !data ? <Skeleton className="h-80 w-full rounded-xl2" /> : <StationBarChart data={data.stationComparison} />}
            </ErrorBoundary>
            <ErrorBoundary>
              {isLoading || !data ? <Skeleton className="h-80 w-full rounded-xl2" /> : <TimeOfDayChart data={data.timeOfDay} />}
            </ErrorBoundary>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ErrorBoundary>
              {isLoading || !data ? (
                <Skeleton className="h-72 w-full rounded-xl2" />
              ) : (
                <VictimAnalysisPanel byAge={data.victimByAge} byGender={data.victimByGender} />
              )}
            </ErrorBoundary>
            <ErrorBoundary>
              {isLoading || !data ? (
                <Skeleton className="h-72 w-full rounded-xl2" />
              ) : (
                <OffenderAnalysisPanel byAge={data.offenderByAge} repeatOffenderRate={data.repeatOffenderRate} />
              )}
            </ErrorBoundary>
          </div>
        </>
      )}
    </div>
  );
}
