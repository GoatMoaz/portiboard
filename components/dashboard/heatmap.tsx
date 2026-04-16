"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotionConfig } from "@/hooks/use-reduced-motion";
import type { GithubHeatmapCell } from "@/lib/github";

type HeatmapProps = {
  cells: GithubHeatmapCell[];
};

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(max-width: 767px)").matches;
  });

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");

    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    query.addEventListener("change", onChange);

    return () => {
      query.removeEventListener("change", onChange);
    };
  }, []);

  return isMobile;
}

const cellColorByLevel: Record<GithubHeatmapCell["level"], string> = {
  0: "var(--heat-0)",
  1: "var(--heat-1)",
  2: "var(--heat-2)",
  3: "var(--heat-3)",
  4: "var(--heat-4)",
};

export function Heatmap({ cells }: HeatmapProps) {
  const { prefersReducedMotion, withDuration } = useReducedMotionConfig();
  const isMobile = useIsMobile();

  const visibleCells = useMemo(() => {
    return isMobile ? cells.slice(-92) : cells;
  }, [cells, isMobile]);

  const columns = useMemo(() => {
    const chunks: GithubHeatmapCell[][] = [];
    for (let index = 0; index < visibleCells.length; index += 7) {
      chunks.push(visibleCells.slice(index, index + 7));
    }

    return chunks;
  }, [visibleCells]);

  const rows = useMemo(() => {
    return Array.from({ length: 7 }, (_, rowIndex) => {
      return columns
        .map((column, columnIndex) => {
          const item = column[rowIndex];

          if (!item) {
            return null;
          }

          return {
            ...item,
            columnIndex,
            rowIndex,
          };
        })
        .filter(
          (
            value,
          ): value is GithubHeatmapCell & { columnIndex: number; rowIndex: number } =>
            Boolean(value),
        );
    });
  }, [columns]);

  const cellSize = 10;
  const gap = 4;
  const width = Math.max(columns.length * (cellSize + gap), 220);
  const height = 7 * (cellSize + gap);

  return (
    <div className="overflow-x-auto">
      <svg
        role="img"
        aria-label="GitHub contribution heatmap"
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-55"
      >
        {rows.map((row, rowIndex) => (
          <motion.g
            key={`row-${rowIndex}`}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: prefersReducedMotion ? 0 : 0.01,
                  delayChildren: prefersReducedMotion ? 0 : rowIndex * 0.04,
                },
              },
            }}
          >
            {row.map((cell) => (
              <motion.rect
                key={cell.date}
                x={cell.columnIndex * (cellSize + gap)}
                y={cell.rowIndex * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={cellColorByLevel[cell.level]}
                initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: withDuration(0.24),
                  ease: "easeOut",
                }}
              >
                <title>{`${cell.date}: ${cell.count} contributions`}</title>
              </motion.rect>
            ))}
          </motion.g>
        ))}
      </svg>
      <div className="mt-3 flex items-center gap-2 text-xs text-(--muted)">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className="h-2.5 w-2.5 rounded-sm"
            style={{
              backgroundColor: cellColorByLevel[level as GithubHeatmapCell["level"]],
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
