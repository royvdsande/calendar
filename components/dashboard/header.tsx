"use client";

import { signOut } from "next-auth/react";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";

export function DashboardHeader({ name }: { name?: string | null }) {
  return (
    <header className="flex items-center justify-between border-b border-border p-4">
      <div>
        <p className="text-sm text-gray-500">Welcome back</p>
        <h1 className="text-xl font-semibold">{name || "Your productivity dashboard"}</h1>
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
