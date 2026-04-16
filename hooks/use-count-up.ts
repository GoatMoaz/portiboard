"use client";

import { useEffect, useRef, useState } from "react";

export type CountUpEasing = (value: number) => number;

export const easeOutExpo: CountUpEasing = (value: number) => {
  if (value === 1) {
    return 1;
  }

  return 1 - 2 ** (-10 * value);
};

type UseCountUpOptions = {
  target: number;
  duration?: number;
  easing?: CountUpEasing;
  start?: number;
};

export function useCountUp({
  target,
  duration = 1200,
  easing = easeOutExpo,
  start = 0,
}: UseCountUpOptions): number {
  const [count, setCount] = useState(start);
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (animationRef.current !== null) {
      window.cancelAnimationFrame(animationRef.current);
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    if (duration <= 0 || target === start) {
      animationRef.current = window.requestAnimationFrame(() => {
        setCount(target);
      });

      return () => {
        if (animationRef.current !== null) {
          window.cancelAnimationFrame(animationRef.current);
        }

        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
        }
      };
    }

    let cancelled = false;
    const startedAt = performance.now();

    const finish = () => {
      if (cancelled) {
        return;
      }

      setCount(target);
      animationRef.current = null;
    };

    const animate = (currentTime: number) => {
      if (cancelled) {
        return;
      }

      const elapsed = currentTime - startedAt;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const nextValue = start + (target - start) * easedProgress;

      setCount(nextValue);

      if (progress < 1) {
        animationRef.current = window.requestAnimationFrame(animate);
        return;
      }

      finish();
    };

    animationRef.current = window.requestAnimationFrame((currentTime) => {
      setCount(start);
      animate(currentTime);
    });
    timeoutRef.current = window.setTimeout(finish, duration + 100);

    return () => {
      cancelled = true;

      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [duration, easing, start, target]);

  return count;
}
