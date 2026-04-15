"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useReducedMotionConfig } from "@/hooks/use-reduced-motion";

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const { prefersReducedMotion, withTransition } = useReducedMotionConfig();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
        transition={withTransition({ duration: 0.35, ease: "easeOut" })}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
