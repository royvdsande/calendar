"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card>
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Dashboard tijdelijk niet beschikbaar</h2>
        <p className="text-sm text-muted-foreground">
          We tonen de UI, maar het laden van dashboarddata ging fout. Probeer opnieuw.
        </p>
        {error.digest && <p className="text-xs text-muted-foreground">Digest: {error.digest}</p>}
        <Button onClick={reset}>Opnieuw laden</Button>
      </div>
    </Card>
  );
}
