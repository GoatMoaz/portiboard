import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import readingTime from "reading-time";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

const postsDirectory = path.join(process.cwd(), "content", "posts");

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
};

export type PostHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type PostSummary = PostFrontmatter & {
  slug: string;
  readingTime: string;
};

export type CompiledPost = {
  slug: string;
  frontmatter: PostFrontmatter;
  content: React.ReactNode;
  readingTime: string;
  headings: PostHeading[];
};

function slugifyHeading(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function extractHeadings(source: string): PostHeading[] {
  const headingRegex = /^(##|###)\s+(.+)$/gm;
  const headings: PostHeading[] = [];

  let match: RegExpExecArray | null = headingRegex.exec(source);

  while (match) {
    const marker = match[1];
    const text = match[2].replace(/`/g, "").trim();

    headings.push({
      id: slugifyHeading(text),
      text,
      level: marker.length as 2 | 3,
    });

    match = headingRegex.exec(source);
  }

  return headings;
}

function normalizeFrontmatter(
  slug: string,
  frontmatter: Partial<PostFrontmatter>,
): PostFrontmatter {
  return {
    title: frontmatter.title ?? slug,
    description: frontmatter.description ?? "",
    date: frontmatter.date ?? new Date().toISOString(),
    author: frontmatter.author ?? "PortiBoard Author",
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
  };
}

export async function getPostSlugs(): Promise<string[]> {
  const entries = await readdir(postsDirectory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => entry.name.replace(/\.mdx$/, ""));
}

export async function getAllPosts(): Promise<PostSummary[]> {
  const slugs = await getPostSlugs();

  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const fullPath = path.join(postsDirectory, `${slug}.mdx`);
      const source = await readFile(fullPath, "utf8");
      const parsed = matter(source);
      const frontmatter = normalizeFrontmatter(
        slug,
        parsed.data as Partial<PostFrontmatter>,
      );

      return {
        ...frontmatter,
        slug,
        readingTime: readingTime(parsed.content).text,
      } satisfies PostSummary;
    }),
  );

  return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export async function getCompiledPostBySlug(slug: string): Promise<CompiledPost | null> {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);

  let source = "";

  try {
    source = await readFile(fullPath, "utf8");
  } catch {
    return null;
  }

  const parsed = matter(source);
  const frontmatter = normalizeFrontmatter(slug, parsed.data as Partial<PostFrontmatter>);
  const headings = extractHeadings(parsed.content);

  const { content } = await compileMDX<PostFrontmatter>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, [rehypePrism, { ignoreMissing: true }]],
      },
    },
  });

  return {
    slug,
    frontmatter,
    content,
    readingTime: readingTime(parsed.content).text,
    headings,
  };
}
