"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Transition } from "framer-motion";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  const onChange = () => {
    onStoreChange();
  };

  mediaQuery.addEventListener("change", onChange);

  return () => {
    mediaQuery.removeEventListener("change", onChange);
  };
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function useReducedMotionConfig() {
  const prefersReducedMotion = useSyncExternalStore(subscribe, getSnapshot, () => false);

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
