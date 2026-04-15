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

  useEffect(() => {
    if (duration <= 0) {
      animationRef.current = window.requestAnimationFrame(() => {
        setCount(target);
      });

      return () => {
        if (animationRef.current !== null) {
          window.cancelAnimationFrame(animationRef.current);
        }
      };
    }

    let startTime: number | null = null;

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const nextValue = start + (target - start) * easedProgress;

      setCount(nextValue);

      if (progress < 1) {
        animationRef.current = window.requestAnimationFrame(animate);
      }
    };

    animationRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, [duration, easing, start, target]);

  return count;
}
