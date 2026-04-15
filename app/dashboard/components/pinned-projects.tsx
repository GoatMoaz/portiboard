"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useReducedMotionConfig } from "@/hooks/use-reduced-motion";
import type { GithubRepoCard } from "@/lib/github";

type PinnedProjectsProps = {
  repos: GithubRepoCard[];
};

export function PinnedProjects({ repos }: PinnedProjectsProps) {
  const { prefersReducedMotion } = useReducedMotionConfig();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {repos.map((repo) => (
        <motion.a
          key={repo.id}
          href={repo.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="block"
          whileHover={
            prefersReducedMotion
              ? undefined
              : {
                  y: -4,
                  scale: 1.02,
                }
          }
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Card className="h-full p-5 transition-shadow duration-200 hover:shadow-[0_18px_34px_rgba(8,26,52,0.2)]">
            <div className="mb-3 flex items-center justify-between">
              <CardTitle>{repo.name}</CardTitle>
              <span className="text-xs font-medium text-(--muted)">
                {repo.stars} stars
              </span>
            </div>
            <CardDescription className="line-clamp-3">{repo.description}</CardDescription>
            <div className="mt-5">
              <Badge>{repo.language}</Badge>
            </div>
          </Card>
        </motion.a>
      ))}
    </div>
  );
}
