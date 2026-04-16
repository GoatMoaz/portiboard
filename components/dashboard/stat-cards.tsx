"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useReducedMotionConfig } from "@/hooks/use-reduced-motion";
import type { GithubStats } from "@/lib/github";

type StatCardsProps = {
  stats: GithubStats;
};

function StatCard({ label, value }: { label: string; value: number }) {
  const { withDuration } = useReducedMotionConfig();

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: withDuration(0.3), ease: "easeOut" }}
    >
      <Card className="h-full p-4">
        <p className="text-xs uppercase tracking-wide text-(--muted)">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">
          {Math.round(value).toLocaleString()}
        </p>
      </Card>
    </motion.div>
  );
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Public Repos" value={stats.publicRepos} />
      <StatCard label="Total Stars" value={stats.totalStars} />
      <StatCard label="Followers" value={stats.followers} />
      <StatCard label="Following" value={stats.following} />
    </div>
  );
}
