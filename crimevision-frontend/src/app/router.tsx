import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";
import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { CrimeAnalyticsPage } from "@/features/crime-analytics/pages/CrimeAnalyticsPage";
import { GeoSpatialIntelPage } from "@/features/geospatial/pages/GeoSpatialIntelPage";
import { CrimeHotspotsPage } from "@/features/hotspots/pages/CrimeHotspotsPage";
import { CriminalNetworkPage } from "@/features/network/pages/CriminalNetworkPage";
import { RepeatOffendersPage } from "@/features/offenders/pages/RepeatOffendersPage";
import { AiPredictionPage } from "@/features/predictions/pages/AiPredictionPage";
import { SociologicalInsightsPage } from "@/features/sociological/pages/SociologicalInsightsPage";
import { InvestigatorDeskPage } from "@/features/investigator/pages/InvestigatorDeskPage";
import { AiAssistantPage } from "@/features/assistant/pages/AiAssistantPage";
import { RegisterCrimePage } from "@/features/crime-analytics/pages/RegisterCrimePage";
import { ReportsPage } from "@/features/reports/pages/ReportsPage";
import { AdminPage } from "@/features/admin/pages/AdminPage";
import { ModulePlaceholder } from "@/shared/components/placeholder/ModulePlaceholder";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  {
    element: <RoleGuard />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <DashboardPage /> }, // Dashboard 1
          { path: "/analytics", element: <CrimeAnalyticsPage /> }, // Dashboard 2
          { path: "/geospatial", element: <GeoSpatialIntelPage /> }, // Dashboard 3
          { path: "/hotspots", element: <CrimeHotspotsPage /> }, // Dashboard 4
          { path: "/network", element: <CriminalNetworkPage /> }, // Dashboard 5
          { path: "/repeat-offenders", element: <RepeatOffendersPage /> }, // Dashboard 6
          { path: "/predictions", element: <AiPredictionPage /> }, // Dashboard 7
          { path: "/sociological", element: <SociologicalInsightsPage /> }, // Dashboard 8
          { path: "/investigator", element: <InvestigatorDeskPage /> }, // Dashboard 9
          { path: "/assistant", element: <AiAssistantPage /> }, // Dashboard 10
          { path: "/register-crime", element: <RegisterCrimePage /> },
          { path: "/reports", element: <ReportsPage /> },
          { path: "/notifications", element: <ModulePlaceholder title="Notification center" /> },
          {
            element: <RoleGuard allow={["administrator"]} />,
            children: [{ path: "/admin", element: <AdminPage /> }],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
