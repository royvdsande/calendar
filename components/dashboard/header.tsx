"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  name?: string | null;
  isGuest?: boolean;
};

export function DashboardHeader({ name, isGuest = false }: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between border-b border-border p-4">
      <div>
        <p className="text-sm text-gray-500">{isGuest ? "Preview mode" : "Welcome back"}</p>
        <h1 className="text-xl font-semibold">
          {name || "Your productivity dashboard"}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        {isGuest ? (
          <Button variant="outline" onClick={() => router.push("/login")}>Sign in</Button>
        ) : (
          <Button variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
            Sign out
          </Button>
        )}
      </div>
    </header>
  );
}
