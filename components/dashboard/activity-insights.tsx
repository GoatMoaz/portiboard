"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { useReducedMotionConfig } from "@/hooks/use-reduced-motion";
import type { GithubHeatmapCell } from "@/lib/github";
import { formatDisplayDate } from "@/lib/utils";

type ActivityInsightsProps = {
  cells: GithubHeatmapCell[];
};

type WeekBucket = {
  start: string;
  end: string;
  total: number;
};

type WeekdayTotals = {
  label: string;
  total: number;
};

const weekdayOrder: Array<{ label: string; index: number }> = [
  { label: "Mon", index: 1 },
  { label: "Tue", index: 2 },
  { label: "Wed", index: 3 },
  { label: "Thu", index: 4 },
  { label: "Fri", index: 5 },
  { label: "Sat", index: 6 },
  { label: "Sun", index: 0 },
];

function pluralizeDay(value: number): string {
  return value === 1 ? "day" : "days";
}

function toUtcDayIndex(isoDate: string): number {
  return new Date(`${isoDate}T00:00:00Z`).getUTCDay();
}

function getUtcDateFromIsoDay(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`);
}

function getUtcTodayIsoDay(): string {
  return new Date().toISOString().slice(0, 10);
}

function getUtcDayDifference(fromIsoDate: string, toIsoDate: string): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const from = getUtcDateFromIsoDay(fromIsoDate).getTime();
  const to = getUtcDateFromIsoDay(toIsoDate).getTime();

  return Math.round((from - to) / millisecondsPerDay);
}

function calculateCurrentStreak(cells: GithubHeatmapCell[]): number {
  let lastActiveIndex = -1;

  for (let index = cells.length - 1; index >= 0; index -= 1) {
    if ((cells[index]?.count ?? 0) > 0) {
      lastActiveIndex = index;
      break;
    }
  }

  if (lastActiveIndex === -1) {
    return 0;
  }

  const lastActiveDate = cells[lastActiveIndex]?.date;

  if (!lastActiveDate) {
    return 0;
  }

  // If the most recent active day is older than yesterday, the streak is broken.
  if (getUtcDayDifference(getUtcTodayIsoDay(), lastActiveDate) > 1) {
    return 0;
  }

  let streak = 0;

  for (let index = lastActiveIndex; index >= 0; index -= 1) {
    if ((cells[index]?.count ?? 0) > 0) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

function calculateLongestStreak(cells: GithubHeatmapCell[]): number {
  let longest = 0;
  let active = 0;

  cells.forEach((cell) => {
    if (cell.count > 0) {
      active += 1;
      longest = Math.max(longest, active);
      return;
    }

    active = 0;
  });

  return longest;
}

function getRecentWeekBuckets(cells: GithubHeatmapCell[]): WeekBucket[] {
  const recent = cells.slice(-84);
  const buckets: WeekBucket[] = [];

  for (let index = 0; index < recent.length; index += 7) {
    const chunk = recent.slice(index, index + 7);

    if (chunk.length === 0) {
      continue;
    }

    buckets.push({
      start: chunk[0]!.date,
      end: chunk[chunk.length - 1]!.date,
      total: chunk.reduce((sum, cell) => sum + cell.count, 0),
    });
  }

  return buckets;
}

function getWeekdayTotals(cells: GithubHeatmapCell[]): WeekdayTotals[] {
  const totalsByDay = [0, 0, 0, 0, 0, 0, 0];

  cells.forEach((cell) => {
    totalsByDay[toUtcDayIndex(cell.date)] += cell.count;
  });

  return weekdayOrder.map((day) => ({
    label: day.label,
    total: totalsByDay[day.index],
  }));
}

export function ActivityInsights({ cells }: ActivityInsightsProps) {
  const { prefersReducedMotion, withDuration } = useReducedMotionConfig();
  const { ref: weeklyCardRef, hasEnteredView: hasEnteredWeeklyCard } = useInView<HTMLDivElement>({
    threshold: 0.32,
    once: true,
  });
  const { ref: weekdayCardRef, hasEnteredView: hasEnteredWeekdayCard } =
    useInView<HTMLDivElement>({
      threshold: 0.32,
      once: true,
    });

  const insights = useMemo(() => {
    const recent30Days = cells.slice(-30);
    const contributionsLast30 = recent30Days.reduce((sum, cell) => sum + cell.count, 0);
    const activeDaysLast30 = recent30Days.filter((cell) => cell.count > 0).length;
    const consistency =
      recent30Days.length === 0
        ? 0
        : Math.round((activeDaysLast30 / recent30Days.length) * 100);
    const bestDay =
      cells.reduce(
        (best, current) => (current.count > best.count ? current : best),
        cells[0] ?? {
          date: "",
          count: 0,
          level: 0,
        },
      ) ?? null;
    const weeklyBuckets = getRecentWeekBuckets(cells);
    const weekdayTotals = getWeekdayTotals(cells);

    return {
      currentStreak: calculateCurrentStreak(cells),
      longestStreak: calculateLongestStreak(cells),
      contributionsLast30,
      activeDaysLast30,
      consistency,
      bestDay,
      weeklyBuckets,
      weekdayTotals,
    };
  }, [cells]);

  if (cells.length === 0) {
    return (
      <div className="rounded-xl border border-(--border) bg-(--surface-2)/70 p-4 text-sm text-(--muted)">
        No contribution activity available yet.
      </div>
    );
  }

  const maxWeeklyTotal = Math.max(...insights.weeklyBuckets.map((bucket) => bucket.total), 0);
  const maxWeekdayTotal = Math.max(...insights.weekdayTotals.map((day) => day.total), 0);
  const topWeekday = insights.weekdayTotals.reduce((best, current) => {
    if (current.total > best.total) {
      return current;
    }

    return best;
  }, insights.weekdayTotals[0]!);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Current Streak",
            value: `${insights.currentStreak.toLocaleString()} ${pluralizeDay(insights.currentStreak)}`,
            note: "Consecutive active days",
          },
          {
            label: "Longest Streak",
            value: `${insights.longestStreak.toLocaleString()} ${pluralizeDay(insights.longestStreak)}`,
            note: "Best run this year",
          },
          {
            label: "Last 30 Days",
            value: insights.contributionsLast30.toLocaleString(),
            note: "Total contributions",
          },
          {
            label: "Consistency",
            value: `${insights.consistency}%`,
            note: `${insights.activeDaysLast30}/${Math.max(cells.slice(-30).length, 1)} active days`,
          },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            className="rounded-xl border border-(--border) bg-(--surface-2)/70 p-3"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: withDuration(0.28),
              delay: prefersReducedMotion ? 0 : index * 0.05,
              ease: "easeOut",
            }}
          >
            <p className="text-[11px] uppercase tracking-wide text-(--muted)">{item.label}</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              {item.value}
            </p>
            <p className="mt-1 text-xs text-(--muted)">{item.note}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div ref={weeklyCardRef} className="rounded-xl border border-(--border) bg-(--surface-2)/70 p-4">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-tight">Weekly Momentum</p>
              <p className="text-xs text-(--muted)">Last 12 weeks of contributions</p>
            </div>
            <p className="text-xs text-(--muted)">
              {insights.weeklyBuckets.reduce((sum, bucket) => sum + bucket.total, 0)} total
            </p>
          </div>

          <div className="flex h-28 items-end gap-1.5">
            {insights.weeklyBuckets.map((bucket, index) => {
              const ratio = maxWeeklyTotal === 0 ? 0 : bucket.total / maxWeeklyTotal;
              const barHeight = bucket.total > 0 ? Math.max(ratio * 100, 8) : 6;

              return (
                <motion.div
                  key={`${bucket.end}-${index}`}
                  className="group relative flex h-full flex-1 items-end"
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: withDuration(0.22),
                    delay: prefersReducedMotion ? 0 : index * 0.03,
                    ease: "easeOut",
                  }}
                  title={`${formatDisplayDate(bucket.start)} - ${formatDisplayDate(bucket.end)}: ${bucket.total} contributions`}
                >
                  <motion.div
                    className="w-full rounded-t-sm bg-(--brand-500)/85 transition-colors duration-200 group-hover:bg-(--brand-400)"
                    initial={{ height: "0%" }}
                    animate={{ height: hasEnteredWeeklyCard ? `${barHeight}%` : "0%" }}
                    transition={{
                      duration: withDuration(0.45),
                      delay: prefersReducedMotion ? 0 : index * 0.04,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </motion.div>
              );
            })}
          </div>

          <div className="mt-2 flex justify-between text-[11px] text-(--muted)">
            <span>12 weeks ago</span>
            <span>Now</span>
          </div>
        </div>

        <div ref={weekdayCardRef} className="rounded-xl border border-(--border) bg-(--surface-2)/70 p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold tracking-tight">Best Rhythm</p>
            {insights.bestDay && insights.bestDay.count > 0 ? (
              <p className="text-xs text-(--muted)">
                Peak day: {formatDisplayDate(insights.bestDay.date)} ({insights.bestDay.count} contributions)
              </p>
            ) : (
              <p className="text-xs text-(--muted)">No peak day available yet.</p>
            )}
          </div>

          <div className="space-y-2.5">
            {insights.weekdayTotals.map((day, index) => {
              const ratio = maxWeekdayTotal === 0 ? 0 : day.total / maxWeekdayTotal;
              const widthPercent = day.total > 0 ? Math.max(ratio * 100, 8) : 0;
              const isTopDay = day.label === topWeekday.label && day.total > 0;
              
              return (
                <motion.div
                  key={day.label}
                  className="grid grid-cols-[2.6rem_1fr_auto] items-center gap-2"
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: withDuration(0.2),
                    delay: prefersReducedMotion ? 0 : index * 0.035,
                    ease: "easeOut",
                  }}
                >
                  <span className="text-xs text-(--muted)">{day.label}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-(--surface)">
                    <motion.div
                      className={isTopDay ? "h-full rounded-full bg-(--accent-500)" : "h-full rounded-full bg-(--brand-500)/80"}
                      initial={{ width: "0%" }}
                      animate={{ width: hasEnteredWeekdayCard ? `${widthPercent}%` : "0%" }}
                      transition={{
                        duration: withDuration(0.4),
                        delay: prefersReducedMotion ? 0 : index * 0.04,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-(--muted)">
                    {day.total.toLocaleString()}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
