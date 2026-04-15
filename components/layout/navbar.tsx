"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/blog", label: "Blog" },
  { href: "/uses", label: "Uses" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isCompact, setIsCompact] = useState(false);

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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-transparent bg-(--surface)/70 backdrop-blur-xl transition-all duration-300",
        isCompact && "border-(--border)",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl items-center justify-between px-4 transition-all duration-300 md:px-8",
          isCompact ? "h-14" : "h-18",
        )}
      >
        <Link href="/" className="text-lg font-bold tracking-tight text-foreground">
          PortiBoard
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-sm font-medium text-(--muted) transition-colors hover:text-foreground"
              >
                <span className={cn("transition-colors", isActive && "text-foreground")}>
                  {item.label}
                </span>
                {isActive ? (
                  <motion.span
                    layoutId="top-nav-active"
                    className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-(--brand-500)"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
