"use client";

import { useEffect, useState, useTransition } from "react";
import { LoaderCircle, Search } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";

const USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const SEARCH_DEBOUNCE_MS = 2000;

type DashboardUsernameSearchProps = {
  activeUsername: string;
};

function isValidGithubUsername(value: string): boolean {
  return USERNAME_PATTERN.test(value);
}

export function DashboardUsernameSearch({
  activeUsername,
}: DashboardUsernameSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(activeUsername);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setInputValue(activeUsername);
  }, [activeUsername]);

  const trimmedValue = inputValue.trim();
  const hasChanged = trimmedValue !== activeUsername;
  const canFetch = trimmedValue.length === 0 || isValidGithubUsername(trimmedValue);

  useEffect(() => {
    if (!hasChanged || !canFetch) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (trimmedValue.length === 0) {
        params.delete("username");
      } else {
        params.set("username", trimmedValue);
      }

      const query = params.toString();
      const nextUrl = query.length > 0 ? `${pathname}?${query}` : pathname;

      startTransition(() => {
        router.replace(nextUrl as Route, { scroll: false });
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    canFetch,
    hasChanged,
    pathname,
    router,
    searchParams,
    startTransition,
    trimmedValue,
  ]);

  return (
    <Card className="p-4 md:p-5">
      <div className="space-y-2">
        <label
          htmlFor="dashboard-username"
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          View Any GitHub Dashboard
        </label>

        <div className="flex items-center gap-2 rounded-xl border border-(--border) bg-(--surface-2)/70 px-3">
          <Search className="h-4 w-4 text-(--muted)" aria-hidden />
          <input
            id="dashboard-username"
            name="username"
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="GitHub username"
            maxLength={39}
            autoComplete="off"
            className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-(--muted)"
          />
        </div>

        {!canFetch && trimmedValue.length > 0 ? (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            GitHub usernames can use letters, numbers, and single hyphens.
          </p>
        ) : null}

        {canFetch && hasChanged ? (
          <p className="flex items-center gap-1.5 text-xs text-(--muted)">
            {isPending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
            {isPending ? "Loading dashboard..." : ""}
          </p>
        ) : null}

        {!hasChanged ? (
          <p className="text-xs text-(--muted)">
            Type a GitHub username to view their dashboard. Try{" "}
            <span className="font-medium text-foreground">vercel</span> for fun!
          </p>
        ) : null}
      </div>
    </Card>
  );
}
