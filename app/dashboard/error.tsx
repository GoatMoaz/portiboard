"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-semibold tracking-tight">
        Dashboard data is unavailable
      </h2>
      <p className="text-sm text-(--muted)">{error.message}</p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
