"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SyncPanel({ readOnly = false }: { readOnly?: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function syncCalendar() {
    if (readOnly) {
      toast("Log in om Google Calendar te syncen.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/calendar/sync", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Calendar sync failed");
      return;
    }

    toast.success(`Synced ${data.synced ?? 0} Google events`);
    router.refresh();
  }

  return (
    <Card>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-semibold">Google Calendar Sync</h3>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? "Je zit in preview mode. Log in om je echte Google events te synchroniseren."
              : "Connect with Google sign-in, then sync your latest events into this dashboard."}
          </p>
        </div>
        <Button onClick={syncCalendar} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Syncing..." : readOnly ? "Sign in to sync" : "Sync now"}
        </Button>
      </div>
    </Card>
  );
}
