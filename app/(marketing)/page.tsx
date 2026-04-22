import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Clock3,
  ExternalLink,
  Filter,
  LayoutDashboard,
  PieChart,
  Rocket,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";
import { AnimatedSection } from "@/components/motion/animated-section";
import { TypingRoles } from "@/components/marketing/typing-roles";
import { Badge } from "@/components/ui/badge";
import { BLUR_DATA_URL, DEFAULT_GITHUB_USERNAME } from "@/lib/constants";
import { getGithubProfile, getGithubRecentRepos, getGithubStats } from "@/lib/github";
import { formatCompactNumber, formatDisplayDate } from "@/lib/utils";

const roleCycle = ["Next.js Engineer", "Problem Solver", "Open Source Contributor"];

const homeHighlights = [
  {
    title: "Live Activity Signal",
    description:
      "Repository, stars, and profile metrics are fetched server-side so every visit reflects current momentum.",
    icon: Rocket,
  },
  {
    title: "Story Through Writing",
    description:
      "Blog posts capture architecture decisions, trade-offs, and experiments so the work has engineering context.",
    icon: BookOpen,
  },
  {
    title: "Tooling Transparency",
    description:
      "The Uses page surfaces your daily stack and current learning path, connecting outputs with your process.",
    icon: Wrench,
  },
];

const dashboardInteractions = [
  {
    title: "Username Searchbar",
    description:
      "Switch dashboards by typing any GitHub username. Input validation and a 2-second debounce keep requests intentional.",
    icon: Search,
    badge: "Debounced + URL synced",
  },
  {
    title: "Crossfilter Analytics",
    description:
      "Filter by week, weekday, or language with click interactions. Each chart updates the others to reveal patterns faster.",
    icon: Filter,
    badge: "Bidirectional chart filtering",
  },
  {
    title: "Interactive Donut + Timeline",
    description:
      "Language slices are selectable and repository cards animate in sequence, making trends and recent shipping activity easy to scan.",
    icon: PieChart,
    badge: "Selectable slices + animated cards",
  },
] as const;

const homepagePaths = [
  {
    title: "Open the full dashboard",
    description:
      "Inspect heatmaps, filter language activity, and explore timeline cards in the full analytics workspace.",
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

const githubStatsFallback = {
  publicRepos: 0,
  totalStars: 0,
  followers: 0,
  following: 0,
};

function githubProfileFallback(username: string) {
  return {
    username,
    displayName: username,
    avatarUrl: "https://avatars.githubusercontent.com/u/0?v=4",
    profileUrl: `https://github.com/${username}`,
    bio: "GitHub data is temporarily unavailable.",
  };
}

async function withFallback<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export default async function MarketingPage() {
  const username = DEFAULT_GITHUB_USERNAME;
  const [profile, stats, recent] = await Promise.all([
    withFallback(getGithubProfile(username), githubProfileFallback(username)),
    withFallback(getGithubStats(username), githubStatsFallback),
    withFallback(getGithubRecentRepos(username), []),
  ]);
  const heroStats = [
    { label: "Repositories", value: formatCompactNumber(stats.publicRepos) },
    { label: "Stars", value: formatCompactNumber(stats.totalStars) },
    { label: "Followers", value: formatCompactNumber(stats.followers) },
    { label: "Recent Pushes", value: String(recent.slice(0, 10).length) },
  ];
  const recentPreview = recent.slice(0, 3);

  return (
    <div className="relative isolate overflow-hidden">
      <div className="grid-backdrop grid-backdrop-page" />
      <div className="relative z-10">
        <section className="relative isolate flex items-center overflow-hidden px-4 pb-18 pt-10 md:px-8 md:pb-22">
          <div className="pulse-glow -left-16 top-6 h-72 w-72 bg-(--brand-500)" />
          <div className="pulse-glow -right-14 bottom-14 h-80 w-80 bg-(--accent-500)" />
          <div className="relative mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-[1.08fr_0.92fr] md:items-center">
            <AnimatedSection className="space-y-6 md:pr-4">
              <Badge className="w-fit bg-(--surface)/60">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Portfolio + Live Analytics
              </Badge>

              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  PortiBoard
                </h1>
                <TypingRoles roles={roleCycle} />
                <p className="max-w-2xl text-base leading-relaxed text-(--muted) sm:text-lg">
                  A responsive command center where your GitHub data becomes a narrative.
                  Search any username, filter contribution patterns, and surface recent
                  work through animated insights.
                </p>
              </div>

              <div className="rounded-[1.3rem] border border-(--border) bg-(--surface)/78 p-2.5 shadow-[0_12px_26px_rgba(8,22,45,0.1)]">
                <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {heroStats.map((item) => (
                    <li
                      key={item.label}
                      className="rounded-xl border border-(--border) bg-(--surface-2)/62 px-3 py-2.5"
                    >
                      <p className="text-[11px] uppercase tracking-wide text-(--muted)">
                        {item.label}
                      </p>
                      <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                        {item.value}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#dashboard-section"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--brand-500) px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-(--brand-400) sm:w-auto"
                >
                  Explore Dashboard
                  <ArrowDown className="h-4 w-4" />
                </a>
                <Link
                  href="/blog"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-(--border) bg-transparent px-4 py-2.5 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-(--surface-2) sm:w-auto"
                >
                  Read the Blog
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection className="mx-auto w-full md:max-w-none" delay={0.1}>
              <div className="relative overflow-hidden rounded-[1.7rem] border border-(--border) bg-(--surface)/88 p-5 shadow-[0_18px_40px_rgba(10,26,50,0.14)] sm:p-6">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-(--brand-300)/45 blur-3xl" />
                <div className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-(--accent-500)/20 blur-3xl" />
                <div className="relative space-y-5">
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
                      loading="eager"
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

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl border border-(--border) bg-(--surface-2)/58 p-3">
                      <p className="text-xs text-(--muted)">Public Repos</p>
                      <p className="text-xl font-semibold text-foreground">
                        {formatCompactNumber(stats.publicRepos)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-(--border) bg-(--surface-2)/58 p-3">
                      <p className="text-xs text-(--muted)">Total Stars</p>
                      <p className="text-xl font-semibold text-foreground">
                        {formatCompactNumber(stats.totalStars)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-(--border) bg-(--surface-2)/62 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-(--muted)">
                      Shipped in this version
                    </p>
                    <ul className="mt-2.5 space-y-2 text-sm text-foreground">
                      <li className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-(--brand-500)" />
                        Username searchbar with validation and debounce
                      </li>
                      <li className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-(--brand-500)" />
                        Chart crossfilter between week, weekday, and language
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-(--brand-500)" />
                        Animated repo timeline for latest pushes
                      </li>
                    </ul>
                    <Link
                      href="/dashboard"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-(--brand-500)"
                    >
                      Try the live dashboard
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
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
                New Dashboard Interactions
              </h2>
              <p className="text-sm text-(--muted)">
                Upgraded controls designed for faster exploration on desktop and mobile.
              </p>
            </div>
          </div>

          <ol className="grid gap-4 md:grid-cols-3">
            {dashboardInteractions.map((item, index) => {
              const Icon = item.icon;

              return (
                <li
                  key={item.title}
                  className="group relative overflow-hidden rounded-[1.35rem] border border-(--border) bg-(--surface)/84 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(10,26,50,0.16)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-(--brand-500)/10 via-transparent to-(--accent-500)/12" />
                  <div className="relative flex items-start justify-between gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-(--surface-2)">
                      <Icon className="h-5 w-5 text-(--brand-500)" />
                    </span>
                    <span className="rounded-full border border-(--border) bg-(--surface-2)/75 px-2 py-0.5 text-[11px] font-semibold text-(--muted)">
                      {`${index + 1}`.padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="relative mt-3 text-base font-semibold tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-(--muted)">
                    {item.description}
                  </p>
                  <Badge className="relative mt-4 w-fit bg-(--surface-2) text-(--muted)">
                    {item.badge}
                  </Badge>
                </li>
              );
            })}
          </ol>
        </AnimatedSection>

        <AnimatedSection
          className="mx-auto w-full max-w-7xl px-4 pb-6 pt-2 md:px-8"
          delay={0.08}
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

          <ul className="grid gap-5 md:grid-cols-3">
            {homeHighlights.map((highlight, index) => {
              const Icon = highlight.icon;

              return (
                <li key={highlight.title} className="relative">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) bg-(--surface-2)">
                    <Icon className="h-5 w-5 text-(--brand-500)" />
                  </span>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-(--muted)">
                    {`0${index + 1}`}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                    {highlight.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-(--muted)">
                    {highlight.description}
                  </p>
                  <div className="mt-5 h-px bg-linear-to-r from-(--brand-500)/45 via-(--border) to-transparent" />
                </li>
              );
            })}
          </ul>
        </AnimatedSection>

        <AnimatedSection
          id="dashboard-section"
          className="mx-auto w-full max-w-7xl px-4 py-14 md:px-8"
          delay={0.1}
        >
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
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

          {recentPreview.length > 0 ? (
            <div className="space-y-3">
              {recentPreview.map((repo, index) => (
                <a
                  key={repo.id}
                  href={repo.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${repo.name} on GitHub`}
                  className="group block"
                >
                  <article className="relative overflow-hidden rounded-[1.25rem] border border-(--border) bg-(--surface)/88 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(10,26,50,0.14)] sm:px-5">
                    <div className="absolute bottom-0 left-0 top-0 w-1 bg-linear-to-b from-(--brand-400) to-(--accent-500)" />
                    <div className="relative flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] uppercase tracking-wide text-(--muted)">
                          {`Recent push ${`${index + 1}`.padStart(2, "0")}`}
                        </p>
                        <h3 className="mt-1 line-clamp-1 text-lg font-semibold tracking-tight text-foreground">
                          {repo.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-(--muted)">
                          {repo.description}
                        </p>
                      </div>
                      <span className="rounded-full border border-(--border) bg-(--surface-2)/75 px-2.5 py-1 text-xs text-(--muted)">
                        {repo.language}
                      </span>
                    </div>

                    <div className="relative mt-4 flex items-center justify-between text-xs text-(--muted)">
                      <span>Updated {formatDisplayDate(repo.pushedAt)}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-(--brand-500)">
                        Open repository
                        <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </article>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.25rem] border border-dashed border-(--border) bg-(--surface)/82 p-5">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                Recent repo activity will appear here
              </h3>
              <p className="mt-1 text-sm text-(--muted)">
                Pushes to public repositories automatically populate this preview.
              </p>
            </div>
          )}
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

          <div className="space-y-3">
            {homepagePaths.map((path) => {
              const Icon = path.icon;

              return (
                <Link key={path.href} href={path.href} className="group">
                  <article className="relative mt-4 overflow-hidden rounded-[1.35rem] border border-(--border) bg-(--surface)/90 px-5 py-4 transition-all duration-300 hover:translate-x-0.5 hover:shadow-[0_12px_24px_rgba(10,26,50,0.14)] sm:px-6 sm:py-5">
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-(--brand-500)/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-(--border) bg-(--surface-2)">
                        <Icon className="h-5 w-5 text-(--brand-500)" />
                      </span>
                      <div>
                        <h3 className="text-base font-semibold tracking-tight text-foreground">
                          {path.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-(--muted)">
                          {path.description}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-(--brand-500)">
                        {path.cta}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
