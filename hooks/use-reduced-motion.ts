"use client";

import { useCallback, useEffect, useState } from "react";
import type { Transition } from "framer-motion";

function getInitialValue(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReducedMotionConfig() {
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState<boolean>(getInitialValue);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", onChange);

    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, []);

  const withDuration = useCallback(
    (duration: number): number => (prefersReducedMotion ? 0 : duration),
    [prefersReducedMotion],
  );

  const withTransition = useCallback(
    (transition: Transition): Transition => {
      if (!prefersReducedMotion) {
        return transition;
      }

      return {
        ...transition,
        duration: 0,
      };
    },
    [prefersReducedMotion],
  );

  return {
    prefersReducedMotion,
    withDuration,
    withTransition,
  };
}
