"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Home, LayoutDashboard, NotebookPen, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import Image from "next/image";

const navItems: Array<{
  href: Route;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/blog", label: "Blog", icon: NotebookPen },
  { href: "/uses", label: "Uses", icon: Wrench },
];

export function Navbar() {
  const pathname = usePathname();
  const [isCompact, setIsCompact] = useState(false);
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const [activePill, setActivePill] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const updateActivePill = useCallback(() => {
    const navElement = desktopNavRef.current;
    if (!navElement) return;

    const activeItem = navElement.querySelector<HTMLElement>("[data-nav-active='true']");

    if (!activeItem) {
      setActivePill((current) => ({ ...current, opacity: 0 }));
      return;
    }

    // offsetLeft/offsetTop are relative to the offsetParent (the nav div),
    // so no viewport scroll or coordinate space issues at all
    setActivePill({
      x: activeItem.offsetLeft,
      y: activeItem.offsetTop,
      width: activeItem.offsetWidth,
      height: activeItem.offsetHeight,
      opacity: 1,
    });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsCompact(window.scrollY > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useLayoutEffect(() => {
    const animationFrameId = window.requestAnimationFrame(updateActivePill);
    const navElement = desktopNavRef.current;

    if (!navElement) {
      return () => {
        window.cancelAnimationFrame(animationFrameId);
      };
    }

    const resizeObserver = new ResizeObserver(() => {
      updateActivePill();
    });

    resizeObserver.observe(navElement);
    window.addEventListener("resize", updateActivePill);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateActivePill);
    };
  }, [isCompact, pathname, updateActivePill]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-transparent bg-linear-to-b from-(--surface)/90 via-(--surface)/74 to-transparent backdrop-blur-xl transition-[border-color,box-shadow] duration-300",
        isCompact && "border-(--border) shadow-[0_14px_36px_rgba(9,20,40,0.12)]",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl items-center justify-between px-4 transition-all duration-300 md:px-8",
          isCompact ? "h-15" : "h-20",
        )}
      >
        <Link href="/" className="group inline-flex items-center text-foreground">
          <Image
            src="/logo.png"
            alt="PortiBoard"
            width={64}
            height={64}
            loading="eager"
          />
          <span className="text-lg font-bold tracking-tight">PortiBoard</span>
        </Link>

        <nav className="hidden md:block">
          <div
            ref={desktopNavRef}
            className="relative flex items-center gap-1 rounded-full border border-(--border) bg-(--surface-2)/88 p-1 shadow-[0_12px_28px_rgba(8,22,45,0.14)]"
          >
            <motion.span
              className="pointer-events-none absolute top-0 left-0 z-0 rounded-full border border-(--brand-500)/40 bg-(--brand-500)/16"
              animate={{
                x: activePill.x,
                y: activePill.y,
                width: activePill.width,
                height: activePill.height,
                opacity: activePill.opacity,
              }}
              transition={{ type: "spring", stiffness: 360, damping: 36, mass: 0.55 }}
            />

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-nav-active={isActive ? "true" : "false"}
                  className="group relative z-10 isolate flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
                >
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5 transition-colors",
                      isActive
                        ? "text-(--brand-500)"
                        : "text-(--muted) group-hover:text-foreground",
                    )}
                  />

                  <span
                    className={cn(
                      "transition-colors",
                      isActive
                        ? "text-foreground"
                        : "text-(--muted) group-hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}

            <motion.span
              className="pointer-events-none absolute inset-x-8 top-0 h-px rounded-full bg-linear-to-r from-transparent via-white/70 to-transparent"
              animate={{ opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
