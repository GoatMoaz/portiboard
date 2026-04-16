"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo, useOptimistic, useState } from "react";
import { Card } from "@/components/ui/card";
import { BLUR_DATA_URL, LEARNING_LOCAL_STORAGE_KEY } from "@/lib/constants";
import type { UsesItem } from "@/lib/uses-data";
import { useInView } from "@/hooks/use-in-view";
import { useReducedMotionConfig } from "@/hooks/use-reduced-motion";

type UsesListProps = {
  items: UsesItem[];
};

type LearningMap = Record<string, boolean>;

export function UsesList({ items }: UsesListProps) {
  const [persisted, setPersisted] = useState<LearningMap>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    const raw = window.localStorage.getItem(LEARNING_LOCAL_STORAGE_KEY);

    if (!raw) {
      return {};
    }

    try {
      return JSON.parse(raw) as LearningMap;
    } catch {
      window.localStorage.removeItem(LEARNING_LOCAL_STORAGE_KEY);
      return {};
    }
  });
  const [optimistic, setOptimistic] = useOptimistic(
    persisted,
    (current: LearningMap, id: string): LearningMap => ({
      ...current,
      [id]: !current[id],
    }),
  );
  const { ref, hasEnteredView } = useInView<HTMLUListElement>({
    threshold: 0.18,
    once: true,
  });
  const { prefersReducedMotion } = useReducedMotionConfig();

  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
      visible: {
        opacity: 1,
        y: 0,
      },
    }),
    [prefersReducedMotion],
  );

  const containerVariants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: {
          staggerChildren: prefersReducedMotion ? 0 : 0.08,
        },
      },
    }),
    [prefersReducedMotion],
  );

  const onToggle = (id: string) => {
    setOptimistic(id);
    setPersisted((current) => {
      const next = {
        ...current,
        [id]: !current[id],
      };

      window.localStorage.setItem(LEARNING_LOCAL_STORAGE_KEY, JSON.stringify(next));

      return next;
    });
  };

  return (
    <motion.ul
      ref={ref}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      animate={hasEnteredView ? "visible" : "hidden"}
    >
      {items.map((item) => {
        const iconSrc = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${item.iconPath}`;
        const isLearning = Boolean(optimistic[item.id]);

        return (
          <motion.li
            key={item.id}
            variants={itemVariants}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Card className="flex h-full flex-col justify-between gap-5 p-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Image
                    src={iconSrc}
                    alt={`${item.name} icon`}
                    width={40}
                    height={40}
                    className="rounded-md"
                    sizes="40px"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                  />
                  <h3 className="text-lg font-semibold tracking-tight">{item.name}</h3>
                </div>
                <p className="text-sm leading-relaxed text-(--muted)">{item.reason}</p>
              </div>
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-(--border) px-3 py-2 text-xs font-medium transition-colors hover:bg-(--surface-2)"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isLearning ? "bg-(--brand-500)" : "bg-(--border)"
                  }`}
                />
                {isLearning ? "Currently learning" : "Mark as learning"}
              </button>
            </Card>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
