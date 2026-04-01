"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  AlertTriangle, 
  Activity, 
  BarChart3, 
  Bell, 
  Settings, 
  Shield, 
  Zap,
  TrendingUp,
  Users,
  Database
} from "lucide-react";

const navItems = [
  { 
    href: "/incidents", 
    label: "Incidents", 
    icon: AlertTriangle,
    description: "Active and resolved incidents"
  },
  { 
    href: "/metrics", 
    label: "Metrics", 
    icon: BarChart3,
    description: "System performance metrics",
    disabled: true
  },
  { 
    href: "/alerts", 
    label: "Alerts", 
    icon: Bell,
    description: "Alert management",
    disabled: true
  },
  { 
    href: "/analytics", 
    label: "Analytics", 
    icon: TrendingUp,
    description: "Incident analytics & trends",
    disabled: true
  }
] as const;

const systemNavItems = [
  { 
    href: "/integrations", 
    label: "Integrations", 
    icon: Zap,
    disabled: true
  },
  { 
    href: "/team", 
    label: "Team", 
    icon: Users,
    disabled: true
  },
  { 
    href: "/settings", 
    label: "Settings", 
    icon: Settings,
    disabled: true
  }
] as const;

export function Sidebar() {
  const pathname = usePathname() ?? "";

  return (
    <aside className="flex w-72 shrink-0 flex-col bg-white border-r border-slate-200/60">
      {/* Header Section */}
      <div className="border-b border-slate-200/60 p-6">
        <Link
          href="/"
          className="flex items-center gap-3 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm group-hover:shadow-md transition-shadow">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              AI Incident Manager
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Operations Dashboard
            </span>
          </div>
        </Link>
      </div>

      {/* System Status */}
      <div className="px-6 py-4 border-b border-slate-200/60">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-emerald-900">System Healthy</div>
            <div className="text-xs text-emerald-600">All services operational</div>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Main navigation">
        <div className="mb-3">
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Operations
          </h3>
        </div>
        
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200 ${
                item.disabled 
                  ? "opacity-50 cursor-not-allowed"
                  : active
                  ? "bg-blue-50 text-blue-700 font-medium shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              onClick={item.disabled ? (e) => e.preventDefault() : undefined}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                active 
                  ? "bg-blue-100 text-blue-600" 
                  : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {item.description}
                  </div>
                )}
              </div>
              {active && (
                <div className="absolute inset-y-0 left-0 w-1 bg-blue-600 rounded-r-full" />
              )}
              {item.disabled && (
                <div className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                  Soon
                </div>
              )}
            </Link>
          );
        })}
        
        {/* System Section */}
        <div className="mt-8 mb-3">
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            System
          </h3>
        </div>
        
        {systemNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                item.disabled 
                  ? "opacity-50 cursor-not-allowed"
                  : active
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              onClick={item.disabled ? (e) => e.preventDefault() : undefined}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                active 
                  ? "bg-blue-100 text-blue-600" 
                  : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="font-medium">{item.label}</span>
              {item.disabled && (
                <div className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                  Soon
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200/60 p-4">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors">
            <Database className="h-4 w-4 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900">AI Incident Manager</div>
            <div className="text-xs text-slate-500">v1.0</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
