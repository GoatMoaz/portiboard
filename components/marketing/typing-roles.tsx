"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotionConfig } from "@/hooks/use-reduced-motion";

type TypingRolesProps = {
  roles: string[];
};

export function TypingRoles({ roles }: TypingRolesProps) {
  const { prefersReducedMotion } = useReducedMotionConfig();
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState(roles[0] ?? "");
  const [isDeleting, setIsDeleting] = useState(false);

  const activeRole = useMemo(() => roles[roleIndex] ?? "", [roleIndex, roles]);
  const renderedText = prefersReducedMotion ? activeRole : displayText;

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const timeout = window.setTimeout(
      () => {
        if (!isDeleting) {
          const nextText = activeRole.slice(0, displayText.length + 1);
          setDisplayText(nextText);

          if (nextText === activeRole) {
            setTimeout(() => {
              setIsDeleting(true);
            }, 950);
          }
        } else {
          const nextText = activeRole.slice(0, Math.max(0, displayText.length - 1));
          setDisplayText(nextText);

          if (nextText.length === 0) {
            setIsDeleting(false);
            setRoleIndex((prev) => (prev + 1) % roles.length);
          }
        }
      },
      isDeleting ? 36 : 68,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [activeRole, displayText, isDeleting, prefersReducedMotion, roles.length]);

  return (
    <p className="typing-cursor text-base font-medium text-(--brand-500) sm:text-lg">
      {renderedText}
    </p>
  );
}
