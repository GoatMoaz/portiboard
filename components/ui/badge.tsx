import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-(--border) bg-(--surface-2) px-2.5 py-1 text-xs font-medium text-(--muted)",
        className,
      )}
    >
      {children}
    </span>
  );
}
