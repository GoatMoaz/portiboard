"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { useReducedMotionConfig } from "@/hooks/use-reduced-motion";
import type { PostSummary } from "@/lib/mdx";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type PostsGridProps = {
  posts: PostSummary[];
};

export function PostsGrid({ posts }: PostsGridProps) {
  const { ref, hasEnteredView } = useInView<HTMLDivElement>({
    threshold: 0.12,
    once: true,
  });
  const { prefersReducedMotion } = useReducedMotionConfig();

  return (
    <motion.div
      ref={ref}
      className="grid gap-4 md:grid-cols-2"
      initial="hidden"
      animate={hasEnteredView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : 0.08,
          },
        },
      }}
    >
      {posts.map((post) => (
        <motion.div
          key={post.slug}
          variants={{
            hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" }}
        >
          <Link href={`/blog/${post.slug}`} className="block h-full">
            <Card className="h-full p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(10,27,52,0.2)]">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                {new Date(post.date).toLocaleDateString()} • {post.readingTime}
              </p>
              <CardTitle className="mt-3 text-xl">{post.title}</CardTitle>
              <CardDescription className="mt-2 line-clamp-3">
                {post.description}
              </CardDescription>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
