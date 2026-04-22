"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-semibold tracking-tight">
        Dashboard data is unavailable
      </h2>
      <p className="text-sm text-(--muted)">{error.message}</p>
      <Button
        variant="outline"
        onClick={() => {
          router.replace("/dashboard");
          window.setTimeout(() => {
            unstable_retry();
          }, 0);
        }}
      >
        Get back to safety
      </Button>
    </div>
  );
}
