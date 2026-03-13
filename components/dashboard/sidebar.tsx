"use client";

import { Calendar, CheckSquare, LayoutDashboard, RefreshCw } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, tab: "overview" },
  { href: "/dashboard?tab=calendar", label: "Calendar", icon: Calendar, tab: "calendar" },
  { href: "/dashboard?tab=tasks", label: "Tasks", icon: CheckSquare, tab: "tasks" },
  { href: "/dashboard?tab=sync", label: "Sync", icon: RefreshCw, tab: "sync" }
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  return (
    <aside className="w-full border-b border-border p-4 md:w-64 md:border-b-0 md:border-r">
      <p className="mb-6 text-lg font-semibold">Productive</p>
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === "/dashboard" && link.tab === currentTab;

          return (
            <Link
              key={link.label}
              href={link.href}
              className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent", active && "bg-accent")}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
