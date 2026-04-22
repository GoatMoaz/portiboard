"use client";

import { motion } from "framer-motion";
import { ExternalLink, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useReducedMotionConfig } from "@/hooks/use-reduced-motion";
import type { GithubRepoCard } from "@/lib/github";
import { formatCompactNumber, formatDisplayDate } from "@/lib/utils";

type RepoTimelineProps = {
  repos: GithubRepoCard[];
};

export function RepoTimeline({ repos }: RepoTimelineProps) {
  const { prefersReducedMotion, withDuration } = useReducedMotionConfig();

  if (repos.length === 0) {
    return (
      <Card className="relative overflow-hidden p-6 text-center">
        <motion.div
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-(--brand-500)/8 via-transparent to-(--brand-400)/14"
          animate={
            prefersReducedMotion
              ? { opacity: 0.45 }
              : {
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.03, 1],
                }
          }
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative space-y-2">
          <Sparkles className="mx-auto h-5 w-5 text-(--brand-500)" />
          <p className="text-sm font-semibold tracking-tight">
            No recent repositories yet
          </p>
          <p className="text-xs text-(--muted)">
            Public repository pushes will appear here once activity is available.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:thin]">
      <div className="relative min-w-max pb-2 pt-1">
        <motion.div
          className="pointer-events-none absolute left-0 right-0 top-6 h-px bg-linear-to-r from-transparent via-(--border) to-transparent"
          animate={
            prefersReducedMotion
              ? { opacity: 0.6 }
              : {
                  opacity: [0.35, 0.8, 0.35],
                }
          }
        />

        <div className="flex min-w-max gap-4">
          {repos.map((repo, index) => (
            <motion.a
              key={repo.id}
              href={repo.repoUrl}
              target="_blank"
              rel="noreferrer"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: withDuration(0.36),
                delay: prefersReducedMotion ? 0 : index * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group block w-60 sm:w-72 shrink-0 outline-none"
            >
              <Card className="relative h-full overflow-hidden border-(--border) bg-linear-to-br from-(--surface) via-(--surface) to-(--surface-2)/72 p-4 transition-all duration-300">
                {!prefersReducedMotion ? (
                  <motion.span
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-linear-to-r from-transparent via-white/35 to-transparent"
                    animate={{ x: ["0%", "280%"] }}
                    transition={{
                      duration: 1.6,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 3.6,
                    }}
                  />
                ) : null}

                <div className="relative flex h-full flex-col gap-4">
                  <div className="flex flex-col items-start justify-between gap-3">
                    <div className="flex justify-between w-full">
                      <p className="line-clamp-1 text-base font-semibold tracking-tight text-foreground">
                        {repo.name}
                      </p>
                      <span className="rounded-full border border-(--border) bg-(--surface-2) px-2 py-0.5 text-[11px] font-semibold text-(--muted)">
                        {`${index + 1}`.padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-(--muted)">
                      {repo.description}
                    </p>
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between text-xs text-(--muted)">
                      <Badge className="bg-(--surface)/80">{repo.language}</Badge>
                      <span className="inline-flex items-center gap-1.5 text-foreground/90">
                        <Star className="h-3.5 w-3.5 text-amber-500" />
                        {formatCompactNumber(repo.stars)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-(--muted)">
                      <span>Last commit {formatDisplayDate(repo.pushedAt)}</span>
                      <span className="inline-flex items-center gap-1 text-(--brand-500)">
                        Open
                        <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
