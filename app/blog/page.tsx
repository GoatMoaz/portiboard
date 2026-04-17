import { AnimatedSection } from "@/components/motion/animated-section";
import { Badge } from "@/components/ui/badge";
import { PostsGrid } from "@/components/blog/posts-grid";
import { getAllPosts } from "@/lib/mdx";

export const metadata = {
  title: "Blog",
  description: "Technical writing about product engineering and frontend architecture.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 md:px-8 md:py-10">
      <AnimatedSection className="space-y-4">
        <Badge>MDX Journal</Badge>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Blog</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-(--muted) md:text-base">
          Notes on building resilient interfaces, shipping with confidence, and improving
          engineering process over time.
        </p>
      </AnimatedSection>

      <PostsGrid posts={posts} />
    </div>
  );
}
