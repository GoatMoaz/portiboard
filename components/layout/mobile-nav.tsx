"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
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

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-(--border) bg-(--surface)/95 px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
      <ul className="grid grid-cols-4 gap-1">
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
                className="relative flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-xs"
              >
                <Icon
                  className={cn(
                    "h-4 w-4 text-(--muted) transition-colors",
                    isActive && "text-(--brand-500)",
                  )}
                />
                <span
                  className={cn(
                    "text-[11px] font-medium text-(--muted)",
                    isActive && "text-foreground",
                  )}
                >
                  {item.label}
                </span>
                {isActive ? (
                  <motion.span
                    layoutId="mobile-active-underline"
                    className="absolute -bottom-0.5 h-0.5 w-12 rounded-full bg-(--brand-500)"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
