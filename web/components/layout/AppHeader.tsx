"use client";

import { usePathname } from "next/navigation";
import { 
  Bell, 
  Search, 
  Settings, 
  User,
  ChevronDown,
  RefreshCw,
  Filter,
  Calendar
} from "lucide-react";

function headerMeta(pathname: string): { title: string; subtitle?: string; showActions?: boolean } {
  if (pathname === "/incidents") {
    return {
      title: "Incident Management",
      subtitle: "Monitor, analyze, and resolve operational incidents with AI-powered insights.",
      showActions: true,
    };
  }
  const detail = pathname.match(/^\/incidents\/([^/]+)$/);
  if (detail) {
    const id = decodeURIComponent(detail[1]);
    return {
      title: `Incident #${id}`,
      subtitle: "Detailed incident analysis with timeline, root cause, and similar incidents",
      showActions: false,
    };
  }
  return {
    title: "AI Incident Manager",
    subtitle: "Intelligent operations management platform",
    showActions: false,
  };
}

export function AppHeader() {
  const pathname = usePathname() ?? "";
  const { title, subtitle, showActions } = headerMeta(pathname);

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200/60">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-slate-600 max-w-3xl">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="flex items-center gap-3 ml-6">
            {showActions && (
              <>
                {/* Search */}
                <div className="hidden md:flex relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search incidents..."
                    className="pl-10 pr-4 py-2 w-80 text-sm border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none transition-all"
                  />
                </div>

                {/* Filter Button */}
                <button className="btn-secondary">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>

                {/* Refresh Button */}
                <button className="btn-ghost">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Time Range Selector */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-slate-50 rounded-lg border border-slate-200">
              <Calendar className="h-4 w-4" />
              <span>Last 30 days</span>
              <ChevronDown className="h-4 w-4" />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Settings */}
            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-3 ml-3 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-slate-900">Operations Engineer</div>
                <div className="text-xs text-slate-500">oncall@company.com</div>
              </div>
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors group">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar (only on incidents page) */}
        {pathname === "/incidents" && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-red-50 to-red-100/50 p-4 rounded-xl border border-red-200/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-700">3</div>
                  <div className="text-xs font-medium text-red-600">Active Incidents</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-4 rounded-xl border border-emerald-200/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <div className="h-3 w-3 bg-emerald-500 rounded-full" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-700">12</div>
                  <div className="text-xs font-medium text-emerald-600">Resolved This Week</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">2.4h</div>
                  <div className="text-xs font-medium text-blue-600">Avg Resolution Time</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-violet-50 to-violet-100/50 p-4 rounded-xl border border-violet-200/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <div className="text-xs font-bold text-violet-600">AI</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-violet-700">89%</div>
                  <div className="text-xs font-medium text-violet-600">AI Accuracy Score</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
