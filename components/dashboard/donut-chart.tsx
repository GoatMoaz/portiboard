"use client";

import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useReducedMotionConfig } from "@/hooks/use-reduced-motion";
import type { GithubLanguageSlice } from "@/lib/github";

type DonutChartProps = {
  data: GithubLanguageSlice[];
  selectedLanguage?: string | null;
  onLanguageSelect?: (language: string | null) => void;
};

type LanguageTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: GithubLanguageSlice }>;
};

function LanguageTooltip({ active, payload }: LanguageTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload as GithubLanguageSlice;

  return (
    <div className="rounded-lg border border-(--border) bg-(--surface) px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-foreground">{item.name}</p>
      <p className="text-(--muted)">{item.percentage}%</p>
    </div>
  );
}

export function DonutChart({
  data,
  selectedLanguage = null,
  onLanguageSelect,
}: DonutChartProps) {
  const { prefersReducedMotion } = useReducedMotionConfig();
  const hasSelection = Boolean(selectedLanguage);

  if (data.length === 0) {
    return (
      <div className="flex h-74 items-center justify-center text-sm text-(--muted)">
        No language activity found for available repositories.
      </div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.32, ease: "easeOut" }}
      className="h-74 min-w-0"
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={240}
        minHeight={240}
        initialDimension={{ width: 240, height: 260 }}
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="58%"
            outerRadius="80%"
            paddingAngle={6}
            isAnimationActive={!prefersReducedMotion}
            animationDuration={850}
            label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                fillOpacity={!hasSelection || selectedLanguage === entry.name ? 1 : 0.24}
                stroke={selectedLanguage === entry.name ? "var(--foreground)" : "none"}
                strokeWidth={selectedLanguage === entry.name ? 1.2 : 0}
                style={onLanguageSelect ? { cursor: "pointer" } : undefined}
                onClick={
                  onLanguageSelect
                    ? () => {
                        onLanguageSelect(
                          selectedLanguage === entry.name ? null : entry.name,
                        );
                      }
                    : undefined
                }
              />
            ))}
          </Pie>
          <Tooltip
            content={<LanguageTooltip />}
            isAnimationActive={false}
            wrapperStyle={{ transition: "none" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
