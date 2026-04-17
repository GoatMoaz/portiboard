import Link from "next/link";
import type { PostHeading } from "@/lib/mdx";

type TocSidebarProps = {
  headings: PostHeading[];
};

export function TocSidebar({ headings }: TocSidebarProps) {
  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="sticky top-24 hidden max-h-[70vh] overflow-y-auto rounded-2xl border border-(--border) bg-(--surface)/90 p-4 lg:block">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-(--muted)">
        On this page
      </p>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "pl-3" : ""}>
            <Link
              href={`#${heading.id}`}
              className="text-sm text-(--muted) transition-colors hover:text-foreground"
            >
              {heading.text}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
