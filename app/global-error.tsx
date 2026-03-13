"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-xl space-y-3 text-center">
            <h1 className="text-2xl font-semibold">Er ging iets fout</h1>
            <p className="text-sm text-muted-foreground">
              De app kon niet volledig laden, maar je UI blijft bereikbaar. Probeer opnieuw of check je server logs.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">Digest: {error.digest}</p>
            )}
            <Button onClick={reset}>Opnieuw proberen</Button>
          </Card>
        </main>
      </body>
    </html>
  );
}
