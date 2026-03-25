"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [{ href: "/incidents", label: "Incidents" }] as const;

export function Sidebar() {
  const pathname = usePathname() ?? "";

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200/90 bg-white lg:w-60">
      <div className="border-b border-slate-200/90 px-4 py-5 lg:px-5">
        <Link
          href="/"
          className="block text-[15px] font-semibold tracking-tight text-slate-900 transition-colors hover:text-slate-700"
        >
          Incident Manager
        </Link>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">Operations dashboard</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2 lg:p-3" aria-label="Main navigation">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-md px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-slate-100 font-medium text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
