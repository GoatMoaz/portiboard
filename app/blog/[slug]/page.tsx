import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimatedSection } from "@/components/motion/animated-section";
import { Badge } from "@/components/ui/badge";
import { TocSidebar } from "@/components/blog/toc-sidebar";
import { getCompiledPostBySlug, getPostSlugs } from "@/lib/mdx";
import { getSiteUrl } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getPostSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCompiledPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const siteUrl = getSiteUrl();
  const ogImage = `${siteUrl}/api/og?title=${encodeURIComponent(post.frontmatter.title)}&author=${encodeURIComponent(post.frontmatter.author)}`;

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: "article",
      publishedTime: post.frontmatter.date,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getCompiledPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:py-10">
      <article className="min-w-0">
        <AnimatedSection className="mb-8 space-y-4">
          <Badge>{post.frontmatter.author}</Badge>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {post.frontmatter.title}
          </h1>
          <p className="text-sm text-(--muted)">
            {new Date(post.frontmatter.date).toLocaleDateString()} • {post.readingTime}
          </p>
          <p className="max-w-3xl text-sm leading-relaxed text-(--muted) md:text-base">
            {post.frontmatter.description}
          </p>
        </AnimatedSection>

        <AnimatedSection className="prose-content min-w-0 max-w-none rounded-2xl border border-(--border) bg-(--surface)/90 p-5 md:p-8">
          {post.content}
        </AnimatedSection>
      </article>

      <AnimatedSection>
        <TocSidebar headings={post.headings} />
      </AnimatedSection>
    </div>
  );
}
