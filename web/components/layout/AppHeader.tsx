"use client";

import { usePathname } from "next/navigation";

function headerMeta(pathname: string): { title: string; subtitle?: string } {
  if (pathname === "/incidents") {
    return {
      title: "Incidents",
      subtitle: "Review status, timeline, and analysis for operational events.",
    };
  }
  const detail = pathname.match(/^\/incidents\/([^/]+)$/);
  if (detail) {
    const id = decodeURIComponent(detail[1]);
    return {
      title: "Incident detail",
      subtitle: `Incident ID ${id}`,
    };
  }
  return {
    title: "Incident Manager",
    subtitle: "Operations console",
  };
}

export function AppHeader() {
  const pathname = usePathname() ?? "";
  const { title, subtitle } = headerMeta(pathname);

  return (
    <header className="shrink-0 border-b border-slate-200/90 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Console</p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">{title}</h1>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}
