"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useReducedMotionConfig } from "@/hooks/use-reduced-motion";
import type { GithubRepoCard } from "@/lib/github";
import { formatDisplayDate } from "@/lib/utils";

type RepoTimelineProps = {
  repos: GithubRepoCard[];
};

export function RepoTimeline({ repos }: RepoTimelineProps) {
  const { prefersReducedMotion } = useReducedMotionConfig();

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <div className="flex min-w-max gap-4 pb-2">
        {repos.map((repo) => (
          <motion.a
            key={repo.id}
            href={repo.repoUrl}
            target="_blank"
            rel="noreferrer"
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    scale: 1.02,
                    y: -4,
                  }
            }
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="block w-70"
          >
            <Card className="h-full space-y-4 p-4 transition-shadow duration-200 hover:shadow-[0_18px_34px_rgba(10,27,51,0.2)]">
              <div>
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  {repo.name}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-(--muted)">
                  {repo.description}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-(--muted)">
                <Badge>{repo.language}</Badge>
                <span>{repo.stars.toLocaleString()} stars</span>
              </div>
              <p className="text-xs text-(--muted)">
                Last commit {formatDisplayDate(repo.pushedAt)}
              </p>
            </Card>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
