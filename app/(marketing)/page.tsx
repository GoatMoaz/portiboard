import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  ExternalLink,
  LayoutDashboard,
  Rocket,
  Sparkles,
  Wrench,
} from "lucide-react";
import { AnimatedSection } from "@/components/motion/animated-section";
import { TypingRoles } from "@/components/marketing/typing-roles";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { BLUR_DATA_URL, DEFAULT_GITHUB_USERNAME } from "@/lib/constants";
import { getGithubProfile, getGithubRecentRepos, getGithubStats } from "@/lib/github";
import { formatCompactNumber, formatDisplayDate } from "@/lib/utils";

const roleCycle = ["Next.js Developer", "Open Source Contributor", "Problem Solver"];

const homeHighlights = [
  {
    title: "Live Activity Signal",
    description:
      "Repository, stars, and profile metrics are fetched server-side so the homepage reflects your latest momentum.",
    icon: Rocket,
  },
  {
    title: "Story Through Writing",
    description:
      "Blog posts capture architecture decisions and experiments, making the portfolio useful for both recruiters and peers.",
    icon: BookOpen,
  },
  {
    title: "Tooling Transparency",
    description:
      "The Uses page showcases your daily stack and active learning path, giving context to the work behind the commits.",
    icon: Wrench,
  },
];

const homepagePaths = [
  {
    title: "Open the full dashboard",
    description:
      "Inspect heatmaps, language distribution, and pinned work in a dedicated activity view.",
    href: "/dashboard",
    cta: "Go to dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Read technical writeups",
    description:
      "Browse engineering notes, implementation details, and postmortems from recent builds.",
    href: "/blog",
    cta: "Go to blog",
    icon: BookOpen,
  },
  {
    title: "See my current setup",
    description:
      "Explore the hardware, software, and utilities that shape the day-to-day development workflow.",
    href: "/uses",
    cta: "Go to uses",
    icon: Wrench,
  },
] as const;

export default async function MarketingPage() {
  const username = DEFAULT_GITHUB_USERNAME;
  const [profile, stats, recent] = await Promise.all([
    getGithubProfile(username),
    getGithubStats(username),
    getGithubRecentRepos(username),
  ]);

  return (
    <div className="relative isolate">
      <div className="grid-backdrop grid-backdrop-page" />
      <div className="relative z-10">
        <section className="relative isolate flex items-center overflow-hidden px-4 pb-20 pt-10 md:px-8">
          <div className="pulse-glow -left-16 top-8 h-64 w-64 bg-(--brand-500)" />
          <div className="pulse-glow -right-12 bottom-20 h-72 w-72 bg-(--accent-500)" />
          <div className="relative mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <AnimatedSection className="space-y-6">
              <Badge className="w-fit bg-(--surface)/60">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Activity Dashboard Portfolio
              </Badge>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  PortiBoard
                </h1>
                <TypingRoles roles={roleCycle} />
                <p className="max-w-2xl text-base leading-relaxed text-(--muted) sm:text-lg">
                  A personal command center that turns GitHub activity into a living story
                  of craft, consistency, and shipping momentum.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#dashboard-section"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-(--brand-500) px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-(--brand-400)"
                >
                  Explore Dashboard
                  <ArrowDown className="h-4 w-4" />
                </a>
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl border border-(--border) bg-transparent px-4 py-2.5 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-(--surface-2)"
                >
                  Read the Blog
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection className="mx-auto w-full md:max-w-none" delay={0.1}>
              <Card className="relative overflow-hidden bg-(--surface)/85">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-(--brand-300)/45 blur-3xl" />
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Image
                      src={profile.avatarUrl}
                      alt={`${profile.displayName} avatar`}
                      width={96}
                      height={96}
                      className="rounded-2xl border border-(--border)"
                      sizes="(max-width: 768px) 96px, 112px"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      priority
                    />
                    <div>
                      <p className="text-lg font-semibold tracking-tight">
                        {profile.displayName}
                      </p>
                      <p className="text-sm text-(--muted)">@{profile.username}</p>
                      <a
                        href={profile.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex text-sm text-(--brand-500) hover:underline"
                      >
                        View GitHub Profile
                      </a>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-(--muted)">{profile.bio}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3">
                      <p className="text-xs text-(--muted)">Public Repos</p>
                      <p className="text-xl font-semibold">
                        {formatCompactNumber(stats.publicRepos)}
                      </p>
                    </Card>
                    <Card className="p-3">
                      <p className="text-xs text-(--muted)">Total Stars</p>
                      <p className="text-xl font-semibold">
                        {formatCompactNumber(stats.totalStars)}
                      </p>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </section>

        <AnimatedSection
          className="mx-auto w-full max-w-7xl px-4 py-14 md:px-8"
          delay={0.05}
        >
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                What lives inside PortiBoard
              </h2>
              <p className="text-sm text-(--muted)">
                A compact portfolio system that combines activity, narrative, and tools.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {homeHighlights.map((highlight) => {
              const Icon = highlight.icon;

              return (
                <Card
                  key={highlight.title}
                  className="h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(10,26,50,0.14)]"
                >
                  <CardContent className="space-y-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-(--surface-2)">
                      <Icon className="h-5 w-5 text-(--brand-500)" />
                    </span>
                    <CardTitle>{highlight.title}</CardTitle>
                    <CardDescription>{highlight.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </AnimatedSection>

        <AnimatedSection
          id="dashboard-section"
          className="mx-auto w-full max-w-7xl px-4 py-14 md:px-8"
          delay={0.1}
        >
          <div className="mb-6 flex flex-col items-start sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Dashboard Preview</h2>
              <p className="text-sm text-(--muted)">
                Real repository activity streamed from GitHub.
              </p>
            </div>
            <Link href="/dashboard" className="text-sm font-semibold text-(--brand-500)">
              Open full dashboard
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recent.slice(0, 3).map((repo) => (
              <a
                key={repo.id}
                href={repo.repoUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${repo.name} on GitHub`}
                className="group"
              >
                <Card className="h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(10,26,50,0.15)]">
                  <CardTitle>{repo.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {repo.description}
                  </CardDescription>
                  <CardContent className="mt-4 flex items-center justify-between text-sm text-(--muted)">
                    <span>{repo.language}</span>
                    <span>{formatDisplayDate(repo.pushedAt)}</span>
                  </CardContent>
                  <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-(--brand-500)">
                    View repository
                    <ExternalLink className="h-3.5 w-3.5" />
                  </p>
                </Card>
              </a>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection
          className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 md:px-8"
          delay={0.15}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Choose your path</h2>
            <p className="text-sm text-(--muted)">
              Jump directly to the part of the portfolio that matches what you want to
              evaluate.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {homepagePaths.map((path) => {
              const Icon = path.icon;

              return (
                <Link key={path.href} href={path.href} className="group">
                  <Card className="h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(10,26,50,0.14)]">
                    <CardContent className="space-y-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-(--surface-2)">
                        <Icon className="h-5 w-5 text-(--brand-500)" />
                      </span>
                      <CardTitle>{path.title}</CardTitle>
                      <CardDescription>{path.description}</CardDescription>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-(--brand-500)">
                        {path.cta}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
