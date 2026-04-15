"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { useReducedMotionConfig } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  id?: string;
};

export function AnimatedSection({
  children,
  className,
  delay = 0,
  once = true,
  id,
}: AnimatedSectionProps) {
  const { ref, isInView, hasEnteredView } = useInView<HTMLElement>({ once });
  const { prefersReducedMotion, withTransition } = useReducedMotionConfig();

  const visible = once ? hasEnteredView : isInView;

  return (
    <motion.section
      ref={ref}
      id={id}
      className={cn(className)}
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
      animate={{ opacity: visible ? 1 : 0, y: visible || prefersReducedMotion ? 0 : 20 }}
      transition={withTransition({
        duration: 0.45,
        delay,
        ease: [0.16, 1, 0.3, 1],
      })}
    >
      {children}
    </motion.section>
  );
}
