"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { BLUR_DATA_URL } from "@/lib/constants";
import type { UsesItem } from "@/lib/uses-data";
import { useInView } from "@/hooks/use-in-view";
import { useReducedMotionConfig } from "@/hooks/use-reduced-motion";

type UsesListProps = {
  items: UsesItem[];
};

export function UsesList({ items }: UsesListProps) {
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
            </Card>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
