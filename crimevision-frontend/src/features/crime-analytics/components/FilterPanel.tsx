import { Filter, RotateCcw } from "lucide-react";
import { Select } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/skeletons/skeleton";
import type { CrimeFilters, FilterOptions } from "@/features/crime-analytics/types/crime-analytics.types";

interface FilterPanelProps {
  filters: CrimeFilters;
  options?: FilterOptions;
  isLoadingOptions: boolean;
  onChange: (patch: Partial<CrimeFilters>) => void;
  onReset: () => void;
}

export function FilterPanel({ filters, options, isLoadingOptions, onChange, onReset }: FilterPanelProps) {
  if (isLoadingOptions || !options) {
    return (
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-40" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-base-100">
          <Filter className="h-4 w-4 text-signal-400" />
          Filters
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        <div>
          <Label>District</Label>
          <Select value={filters.district ?? ""} onChange={(e) => onChange({ district: e.target.value || undefined })}>
            <option value="">All districts</option>
            {options.districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
        </div>
        <div>
          <Label>Police station</Label>
          <Select value={filters.station ?? ""} onChange={(e) => onChange({ station: e.target.value || undefined })}>
            <option value="">All stations</option>
            {options.stations.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <div>
          <Label>Crime type</Label>
          <Select value={filters.crimeType ?? ""} onChange={(e) => onChange({ crimeType: e.target.value || undefined })}>
            <option value="">All types</option>
            {options.crimeTypes.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={filters.status ?? ""} onChange={(e) => onChange({ status: e.target.value || undefined })}>
            <option value="">All statuses</option>
            {options.statuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </Select>
        </div>
        <div>
          <Label>Date from</Label>
          <Input type="date" value={filters.dateFrom ?? ""} onChange={(e) => onChange({ dateFrom: e.target.value || undefined })} />
        </div>
        <div>
          <Label>Date to</Label>
          <Input type="date" value={filters.dateTo ?? ""} onChange={(e) => onChange({ dateTo: e.target.value || undefined })} />
        </div>
        <div>
          <Label>Victim age group</Label>
          <Select value={filters.victimAgeGroup ?? ""} onChange={(e) => onChange({ victimAgeGroup: e.target.value || undefined })}>
            <option value="">All ages</option>
            {options.ageGroups.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
        </div>
        <div>
          <Label>Victim gender</Label>
          <Select value={filters.victimGender ?? ""} onChange={(e) => onChange({ victimGender: e.target.value || undefined })}>
            <option value="">All genders</option>
            {options.genders.map((g) => <option key={g} value={g}>{g}</option>)}
          </Select>
        </div>
      </div>
    </Card>
  );
}
