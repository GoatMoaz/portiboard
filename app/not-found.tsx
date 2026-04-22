import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="text-sm text-(--muted)">This route does not exist or has moved.</p>
      <Link href="/">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
