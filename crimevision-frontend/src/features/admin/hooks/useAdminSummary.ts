import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api/admin.api";

export function useAdminSummary() {
  return useQuery({
    queryKey: ["admin-summary"],
    queryFn: adminApi.getSummary,
    staleTime: 60_000,
  });
}
