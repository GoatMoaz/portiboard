import Image from "next/image";
import { Suspense } from "react";
import { RefreshCw } from "lucide-react";
import { AnimatedSection } from "@/components/motion/animated-section";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BLUR_DATA_URL, DEFAULT_GITHUB_USERNAME } from "@/lib/constants";
import {
  getGithubHeatmap,
  getGithubLanguageBreakdown,
  getGithubPinnedProjects,
  getGithubProfile,
  getGithubRecentRepos,
  getGithubStats,
} from "@/lib/github";
import { DonutChart } from "./components/donut-chart";
import { Heatmap } from "./components/heatmap";
import { PinnedProjects } from "./components/pinned-projects";
import { RepoTimeline } from "./components/repo-timeline";
import { StatCards } from "./components/stat-cards";

function PanelSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-52" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 w-full" />
      </CardContent>
    </Card>
  );
}

function TimelineSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Skeleton className="h-36 w-65" />
          <Skeleton className="h-36 w-65" />
          <Skeleton className="h-36 w-65" />
        </div>
      </CardContent>
    </Card>
  );
}

async function StatsSection({ username }: { username: string }) {
  const stats = await getGithubStats(username);

  return <StatCards stats={stats} />;
}

async function HeatmapSection({ username }: { username: string }) {
  const heatmap = await getGithubHeatmap(username);

  return (
    <AnimatedSection>
      <Card>
        <CardHeader>
          <CardTitle>GitHub Heatmap</CardTitle>
          <CardDescription>
            Contribution intensity over the last 12 months.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Heatmap cells={heatmap} />
        </CardContent>
      </Card>
    </AnimatedSection>
  );
}

async function LanguageSection({ username }: { username: string }) {
  const languages = await getGithubLanguageBreakdown(username);

  return (
    <AnimatedSection>
      <Card>
        <CardHeader>
          <CardTitle>Language Breakdown</CardTitle>
          <CardDescription>Top languages by weighted repository size.</CardDescription>
        </CardHeader>
        <CardContent>
          <DonutChart data={languages} />
        </CardContent>
      </Card>
    </AnimatedSection>
  );
}

async function TimelineSection({ username }: { username: string }) {
  const repos = await getGithubRecentRepos(username);

  return (
    <AnimatedSection>
      <Card>
        <CardHeader>
          <CardTitle>Repo Activity Timeline</CardTitle>
          <CardDescription>10 most recently pushed repositories.</CardDescription>
        </CardHeader>
        <CardContent>
          <RepoTimeline repos={repos} />
        </CardContent>
      </Card>
    </AnimatedSection>
  );
}

async function PinnedSection({ username }: { username: string }) {
  const projects = await getGithubPinnedProjects(username);

  return (
    <AnimatedSection>
      <Card>
        <CardHeader>
          <CardTitle>Pinned Projects Spotlight</CardTitle>
          <CardDescription>
            Most starred repositories, highlighted as featured work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PinnedProjects repos={projects} />
        </CardContent>
      </Card>
    </AnimatedSection>
  );
}

export default async function DashboardPage() {
  const username = DEFAULT_GITHUB_USERNAME;
  const profile = await getGithubProfile(username);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 md:px-8 md:py-10">
      <AnimatedSection>
        <Card className="overflow-hidden p-0">
          <div className="grid gap-4 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
            <Image
              src={profile.avatarUrl}
              alt={`${profile.displayName} avatar`}
              width={86}
              height={86}
              className="rounded-2xl border border-(--border)"
              sizes="(max-width: 768px) 86px, 96px"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              priority
            />
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Activity Dashboard
                </h1>
                <Badge>@{profile.username}</Badge>
              </div>
              <p className="text-sm leading-relaxed text-(--muted)">{profile.bio}</p>
            </div>
            <div className="justify-self-start md:justify-self-end">
              <a
                href={profile.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--border) bg-transparent px-4 py-2.5 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-(--surface-2)"
              >
                <RefreshCw className="h-4 w-4" />
                GitHub Profile
              </a>
            </div>
          </div>
        </Card>
      </AnimatedSection>

      <Suspense fallback={<PanelSkeleton />}>
        <StatsSection username={username} />
      </Suspense>

      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<PanelSkeleton />}>
          <HeatmapSection username={username} />
        </Suspense>
        <Suspense fallback={<PanelSkeleton />}>
          <LanguageSection username={username} />
        </Suspense>
      </div>

      <Suspense fallback={<TimelineSkeleton />}>
        <TimelineSection username={username} />
      </Suspense>

      <Suspense fallback={<PanelSkeleton />}>
        <PinnedSection username={username} />
      </Suspense>
    </div>
  );
}
