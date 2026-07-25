import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { CatalystUser } from "@/shared/lib/catalyst/client";

interface RoleGuardProps {
  allow?: CatalystUser["role"][];
}

/** Route guard: requires an authenticated session, and optionally a role. */
export function RoleGuard({ allow }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-base-950 text-base-400 text-sm">
        Verifying session…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
