import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { 
  ChevronsLeft, ChevronsRight, LogOut, Search, ChevronRight, Menu, X,
  Home, BarChart2, Globe, Flame, GitFork, Users, Brain, 
  Lightbulb, ClipboardCheck, MessageSquare, FileText, Settings, PlusCircle
} from "lucide-react";
import { NAV_ITEMS } from "@/shared/constants/nav";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AssistantDock } from "@/features/assistant/components/AssistantDock";
import { LanguageSelector } from "@/shared/components/ui/LanguageSelector";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";


// Dynamic Lucide icon mapper for the sidebar
function SidebarIcon({ name, className }: { name: string; className?: string }) {
  const map: Record<string, any> = {
    "layout-dashboard": Home,
    "chart-bar": BarChart2,
    "map-2": Globe,
    "flame": Flame,
    "affiliate": GitFork,
    "users": Users,
    "brain": Brain,
    "bulb": Lightbulb,
    "clipboard-list": ClipboardCheck,
    "message-square": MessageSquare,
    "file-report": FileText,
    "shield-cog": Settings,
    "plus-circle": PlusCircle,
  };
  const Icon = map[name] || Home;
  return <Icon className={className} />;
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleNav = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <div className="flex min-h-screen bg-base-950 text-base-300">
      {/* Desktop Sidebar - Royal Blue */}
      <aside
        className={cn(
          "hidden md:flex sticky top-0 h-screen shrink-0 flex-col bg-base-900 text-white shadow-lg transition-all z-40",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        {/* Sidebar Header Emblem */}
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-4">
          <img 
            src="/ksp-logo.png" 
            alt="Karnataka State Police Logo" 
            className="h-9 w-9 shrink-0 object-contain" 
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-wide text-white uppercase font-display">Sentinel AI</p>
              <p className="truncate text-[9px] text-blue-200 tracking-wider font-semibold uppercase">Karnataka State Police</p>
            </div>
          )}
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
          {visibleNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold tracking-wide transition-all relative group",
                  isActive
                    ? "bg-signal-400 text-white shadow-md shadow-black/10"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <SidebarIcon name={item.icon} className="h-4.5 w-4.5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  
                  {/* Chevron Right indicator for active dashboard item */}
                  {isActive && !collapsed && (
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white" />
                  )}
                  
                  {/* Tooltip on hover if collapsed */}
                  {collapsed && (
                    <span className="absolute left-16 scale-0 rounded bg-slate-900 p-2 text-xs text-white group-hover:scale-100 transition-all z-50">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Toggle Collapse */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center justify-center gap-2 border-t border-white/10 py-3.5 text-[11px] font-semibold text-blue-200 hover:text-white"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && "Collapse Sidebar"}
        </button>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex w-72 max-w-[85vw] flex-col bg-base-900 text-white p-4 shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-3">
              <div className="flex items-center gap-2.5">
                <img 
                  src="/ksp-logo.png" 
                  alt="Karnataka State Police Logo" 
                  className="h-8 w-8 shrink-0 object-contain" 
                />
                <div>
                  <p className="text-sm font-bold tracking-wide text-white uppercase font-display">Sentinel AI</p>
                  <p className="text-[9px] text-blue-200 tracking-wider font-semibold uppercase">Karnataka State Police</p>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              {visibleNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold tracking-wide transition-all relative",
                      isActive
                        ? "bg-signal-400 text-white shadow-md"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    )
                  }
                >
                  <SidebarIcon name={item.icon} className="h-4.5 w-4.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {user && (
              <div className="border-t border-white/10 pt-3 mt-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{user.name}</p>
                  <span className="text-[10px] text-blue-200 capitalize font-medium">{user.role}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-rose-300 hover:text-rose-100 bg-rose-500/20 rounded-lg"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-1 flex-col min-w-0">
        {/* Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-base-800 bg-base-850 px-3 sm:px-6 shadow-sm">
          {/* Mobile Menu Toggle & Logo */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-base-750 text-base-200 hover:bg-base-700 hover:text-white border border-base-800"
              aria-label="Toggle mobile menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <img src="/ksp-logo.png" alt="KSP Logo" className="h-7 w-7 object-contain" />
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-500" />
            <Input 
              placeholder="Search case ID, district, station…" 
              className="h-9 pl-9 text-xs border-base-800 bg-base-750 focus-visible:ring-signal-500 text-base-200 w-full" 
            />
          </div>

          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            {/* Indian Language Selector via Google Translate */}
            <LanguageSelector />




            {/* User credentials profiles block */}
            <div className="flex items-center gap-2 sm:gap-3 border-l border-base-800 pl-3 sm:pl-5">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-signal-500 text-xs sm:text-sm font-bold text-white shadow-sm">
                {user?.name?.slice(0, 2).toUpperCase() ?? "??"}
              </div>
              {user && (
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-base-200 leading-tight">{user.name}</p>
                  <div className="mt-0.5 flex gap-1">
                    <Badge tone="signal" className="text-[9px] px-1 py-0 rounded bg-signal-400/10 text-signal-400 font-bold border border-signal-400/20 capitalize">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              )}
              <button 
                onClick={logout} 
                aria-label="Sign out" 
                className="ml-1 sm:ml-2 text-base-500 hover:text-alert-red transition-colors"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <AssistantDock />
    </div>
  );
}

