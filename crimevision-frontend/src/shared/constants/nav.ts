import type { CatalystUser } from "@/shared/lib/catalyst/client";

export interface NavItem {
  label: string;
  path: string;
  icon: string; // Lucide icon name mapping
  roles?: CatalystUser["role"][];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: "layout-dashboard" }, // Dashboard 1: Executive Intelligence
  { label: "Crime Analytics", path: "/analytics", icon: "chart-bar" }, // Dashboard 2: Crime Analytics
  { label: "Geo Intelligence", path: "/geospatial", icon: "map-2" }, // Dashboard 3: GeoSpatial Intelligence
  { label: "Hotspots", path: "/hotspots", icon: "flame" }, // Dashboard 4: Crime Hotspots
  { label: "Network Analysis", path: "/network", icon: "affiliate" }, // Dashboard 5: Criminal Networks
  { label: "Repeat Offenders", path: "/repeat-offenders", icon: "users" }, // Dashboard 6: Repeat Offenders & MO
  { label: "AI Prediction", path: "/predictions", icon: "brain" }, // Dashboard 7: AI Prediction & Risk
  { label: "Sociological Insights", path: "/sociological", icon: "bulb" }, // Dashboard 8: Sociological Insights
  { label: "Investigator Support", path: "/investigator", icon: "clipboard-list" }, // Dashboard 9: Decision Support
  { label: "AI Crime Assistant", path: "/assistant", icon: "message-square" }, // Dashboard 10: AI Chat Workspace
  { label: "Register Crime", path: "/register-crime", icon: "plus-circle" },
  { label: "Reports", path: "/reports", icon: "file-report" },
  { label: "Administration", path: "/admin", icon: "shield-cog", roles: ["administrator"] },
];
