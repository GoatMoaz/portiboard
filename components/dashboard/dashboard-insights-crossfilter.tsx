"use client";

import { useMemo, useState } from "react";
import {
  ActivityInsights,
  type ActivityWeekRange,
} from "@/components/dashboard/activity-insights";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  GithubHeatmapCell,
  GithubLanguageDailyActivity,
  GithubLanguageSlice,
} from "@/lib/github";
import { formatDisplayDate } from "@/lib/utils";

type DashboardInsightsCrossfilterProps = {
  heatmap: GithubHeatmapCell[];
  languages: GithubLanguageSlice[];
  languageActivity: GithubLanguageDailyActivity[];
};

function levelFromCount(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0 || maxCount === 0) {
    return 0;
  }

  const ratio = count / maxCount;

  if (ratio < 0.25) {
    return 1;
  }

  if (ratio < 0.5) {
    return 2;
  }

  if (ratio < 0.75) {
    return 3;
  }

  return 4;
}

function toUtcDayIndex(isoDate: string): number {
  return new Date(`${isoDate}T00:00:00Z`).getUTCDay();
}

function isDateWithinRange(date: string, range: ActivityWeekRange): boolean {
  return date >= range.start && date <= range.end;
}

function weekdayLabelFromIndex(index: number): string {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return labels[index] ?? "Unknown";
}

function aggregateLanguageSlices(
  activity: GithubLanguageDailyActivity[],
): GithubLanguageSlice[] {
  const totals = new Map<string, { value: number; color: string }>();

  activity.forEach((point) => {
    const current = totals.get(point.language) ?? { value: 0, color: point.color };
    totals.set(point.language, {
      value: current.value + point.count,
      color: current.color,
    });
  });

  const entries = Array.from(totals.entries())
    .map(([name, info]) => ({
      name,
      value: info.value,
      color: info.color,
    }))
    .sort((a, b) => b.value - a.value);

  if (entries.length === 0) {
    return [];
  }

  const total = entries.reduce((sum, entry) => sum + entry.value, 0);

  return entries.map((entry) => ({
    name: entry.name,
    value: entry.value,
    percentage: Number(((entry.value / total) * 100).toFixed(1)),
    color: entry.color,
  }));
}

function buildLanguageScopedCells(
  allCells: GithubHeatmapCell[],
  languageActivity: GithubLanguageDailyActivity[],
  selectedLanguage: string | null,
): GithubHeatmapCell[] {
  if (!selectedLanguage) {
    return allCells;
  }

  const countsByDate = new Map<string, number>();

  languageActivity.forEach((point) => {
    if (point.language !== selectedLanguage) {
      return;
    }

    countsByDate.set(point.date, (countsByDate.get(point.date) ?? 0) + point.count);
  });

  const maxCount = Math.max(...Array.from(countsByDate.values()), 0);

  return allCells.map((cell) => {
    const count = countsByDate.get(cell.date) ?? 0;

    return {
      date: cell.date,
      count,
      level: levelFromCount(count, maxCount),
    };
  });
}

export function DashboardInsightsCrossfilter({
  heatmap,
  languages,
  languageActivity,
}: DashboardInsightsCrossfilterProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedWeekRange, setSelectedWeekRange] = useState<ActivityWeekRange | null>(
    null,
  );
  const [selectedWeekdayIndex, setSelectedWeekdayIndex] = useState<number | null>(null);

  const handleLanguageSelect = (nextLanguage: string | null) => {
    setSelectedLanguage(nextLanguage);

    if (nextLanguage !== null) {
      setSelectedWeekRange(null);
      setSelectedWeekdayIndex(null);
    }
  };

  const handleWeekRangeChange = (nextWeekRange: ActivityWeekRange | null) => {
    setSelectedWeekRange(nextWeekRange);

    if (nextWeekRange !== null) {
      setSelectedLanguage(null);
      setSelectedWeekdayIndex(null);
    }
  };

  const handleWeekdayIndexChange = (nextWeekdayIndex: number | null) => {
    setSelectedWeekdayIndex(nextWeekdayIndex);

    if (nextWeekdayIndex !== null) {
      setSelectedLanguage(null);
      setSelectedWeekRange(null);
    }
  };

  const donutData = useMemo(() => {
    const hasTemporalFilter = selectedWeekRange !== null || selectedWeekdayIndex !== null;

    if (!hasTemporalFilter) {
      return languages;
    }

    const filteredActivity = languageActivity.filter((point) => {
      if (selectedWeekRange && !isDateWithinRange(point.date, selectedWeekRange)) {
        return false;
      }

      if (
        selectedWeekdayIndex !== null &&
        toUtcDayIndex(point.date) !== selectedWeekdayIndex
      ) {
        return false;
      }

      return true;
    });

    return aggregateLanguageSlices(filteredActivity);
  }, [languageActivity, languages, selectedWeekRange, selectedWeekdayIndex]);

  const languageScopedCells = useMemo(
    () => buildLanguageScopedCells(heatmap, languageActivity, selectedLanguage),
    [heatmap, languageActivity, selectedLanguage],
  );

  const hasFilters =
    selectedLanguage !== null ||
    selectedWeekRange !== null ||
    selectedWeekdayIndex !== null;

  const temporalFilterLabel =
    selectedWeekRange || selectedWeekdayIndex !== null
      ? `${
          selectedWeekRange
            ? `Week filter: ${formatDisplayDate(selectedWeekRange.start)} - ${formatDisplayDate(selectedWeekRange.end)}`
            : "No week filter"
        } | ${
          selectedWeekdayIndex !== null
            ? `Weekday filter: ${weekdayLabelFromIndex(selectedWeekdayIndex)}`
            : "No weekday filter"
        }`
      : "";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Contribution Insights</CardTitle>
          <CardDescription>
            Streaks, weekly momentum, and contribution rhythm over the last year.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ActivityInsights
            cells={languageScopedCells}
            selectedWeekRange={selectedWeekRange}
            onWeekRangeChange={handleWeekRangeChange}
            selectedWeekdayIndex={selectedWeekdayIndex}
            onWeekdayIndexChange={handleWeekdayIndexChange}
          />
        </CardContent>
      </Card>

      <Card className="flex h-full flex-col lg:gap-10">
        <CardHeader className="mb-0">
          <div className="flex justify-between items-center">
            <CardTitle>Language Breakdown</CardTitle>
            <Button
              type="button"
              variant="ghost"
              className="px-3 py-2 text-xs"
              onClick={() => {
                setSelectedLanguage(null);
                setSelectedWeekRange(null);
                setSelectedWeekdayIndex(null);
              }}
              disabled={!hasFilters}
            >
              Clear filters
            </Button>
          </div>

          <CardDescription>
            Language distribution across repositories and time.
          </CardDescription>
          <p className="mt-1 min-h-4 truncate text-xs text-(--muted)">
            {temporalFilterLabel}
          </p>
        </CardHeader>

        <CardContent className="space-y-2">
          <DonutChart
            data={donutData}
            selectedLanguage={selectedLanguage}
            onLanguageSelect={handleLanguageSelect}
          />
          <p className="text-xs text-(--muted)">
            {selectedLanguage
              ? `${selectedLanguage} is selected. Click again to clear it.`
              : "Select a slice to filter the insights while keeping this full language view."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
