"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Home, LayoutDashboard, NotebookPen, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items: Array<{
  href: Route;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/blog",
    label: "Blog",
    icon: NotebookPen,
  },
  {
    href: "/uses",
    label: "Uses",
    icon: Wrench,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const navListRef = useRef<HTMLUListElement>(null);
  const [activePill, setActivePill] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const updateActiveIndicators = useCallback(() => {
    const listElement = navListRef.current;
    if (!listElement) {
      return;
    }

    const activeItem = listElement.querySelector<HTMLElement>("[data-nav-active='true']");

    if (!activeItem) {
      setActivePill((current) => ({ ...current, opacity: 0 }));
      return;
    }

    const listRect = listElement.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();

    setActivePill({
      x: itemRect.left - listRect.left,
      y: itemRect.top - listRect.top,
      width: itemRect.width,
      height: itemRect.height,
      opacity: 1,
    });
  }, []);

  useLayoutEffect(() => {
    const animationFrameId = window.requestAnimationFrame(updateActiveIndicators);
    const listElement = navListRef.current;

    if (!listElement) {
      return () => {
        window.cancelAnimationFrame(animationFrameId);
      };
    }

    const resizeObserver = new ResizeObserver(() => {
      updateActiveIndicators();
    });

    resizeObserver.observe(listElement);
    listElement.querySelectorAll("li").forEach((itemElement) => {
      resizeObserver.observe(itemElement);
    });
    window.addEventListener("resize", updateActiveIndicators);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateActiveIndicators);
    };
  }, [pathname, updateActiveIndicators]);

  return (
    <nav
      aria-label="Primary mobile"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[calc(10px+env(safe-area-inset-bottom))] md:hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto relative w-full max-w-md rounded-2xl border border-(--border) bg-(--surface)/90 p-1.5 shadow-[0_18px_42px_rgba(8,22,45,0.24)] backdrop-blur-2xl"
      >
        <motion.span
          className="pointer-events-none absolute inset-x-10 top-0 h-px rounded-full bg-linear-to-r from-transparent via-white/70 to-transparent"
          animate={{ opacity: [0.3, 0.65, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />

        <ul ref={navListRef} className="relative grid grid-cols-4 gap-1">
          <motion.span
            className="pointer-events-none absolute top-0 left-0 z-0 rounded-xl border border-(--brand-500)/45 bg-(--brand-500)/17"
            animate={{
              x: activePill.x,
              y: activePill.y,
              width: activePill.width,
              height: activePill.height,
              opacity: activePill.opacity,
            }}
            transition={{ type: "spring", stiffness: 360, damping: 36, mass: 0.55 }}
          />

          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  data-nav-active={isActive ? "true" : "false"}
                  className="group relative z-10 isolate flex h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 text-xs"
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-(--brand-500)"
                        : "text-(--muted) group-hover:text-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[11px] font-medium transition-colors",
                      isActive
                        ? "text-foreground"
                        : "text-(--muted) group-hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </nav>
  );
}
