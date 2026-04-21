import Image from "next/image";
import { Suspense } from "react";
import { RefreshCw } from "lucide-react";
import { ActivityInsights } from "@/components/dashboard/activity-insights";
import { DashboardUsernameSearch } from "@/components/dashboard/dashboard-username-search";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { PinnedProjects } from "@/components/dashboard/pinned-projects";
import { RepoTimeline } from "@/components/dashboard/repo-timeline";
import { StatCards } from "@/components/dashboard/stat-cards";
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
  type GithubHeatmapCell,
  type GithubLanguageSlice,
  type GithubProfile,
  type GithubRepoCard,
  type GithubStats,
  getGithubHeatmap,
  getGithubLanguageBreakdown,
  getGithubPinnedProjects,
  getGithubProfile,
  getGithubRecentRepos,
  getGithubStats,
} from "@/lib/github";

const USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

type DashboardSearchParams = {
  username?: string | string[];
};

type DashboardPageProps = {
  searchParams?: DashboardSearchParams | Promise<DashboardSearchParams>;
};

function getUsernameParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return (value[0] ?? "").trim();
  }

  return (value ?? "").trim();
}

function ProfileSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-4 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
        <Skeleton className="h-21.5 w-21.5 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="h-full p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-7 w-20" />
        </Card>
      ))}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <Card className="h-full">
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

async function ProfileSection({
  profilePromise,
}: {
  profilePromise: Promise<GithubProfile>;
}) {
  const profile = await profilePromise;

  return (
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
          loading="eager"
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
  );
}

async function StatsSection({
  statsPromise,
}: {
  statsPromise: Promise<GithubStats>;
}) {
  const stats = await statsPromise;

  return <StatCards stats={stats} />;
}

async function ActivitySection({
  activityPromise,
}: {
  activityPromise: Promise<GithubHeatmapCell[]>;
}) {
  const activity = await activityPromise;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Contribution Insights</CardTitle>
        <CardDescription>
          Streaks, weekly momentum, and contribution rhythm over the last year.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ActivityInsights cells={activity} />
      </CardContent>
    </Card>
  );
}

async function LanguageSection({
  languagesPromise,
}: {
  languagesPromise: Promise<GithubLanguageSlice[]>;
}) {
  const languages = await languagesPromise;

  return (
    <Card className="flex h-full flex-col gap-10">
      <CardHeader>
        <CardTitle>Language Breakdown</CardTitle>
        <CardDescription>Top languages by weighted repository size.</CardDescription>
      </CardHeader>
      <CardContent>
        <DonutChart data={languages} />
      </CardContent>
    </Card>
  );
}

async function TimelineSection({
  reposPromise,
}: {
  reposPromise: Promise<GithubRepoCard[]>;
}) {
  const repos = await reposPromise;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repo Activity Timeline</CardTitle>
        <CardDescription>10 most recently pushed repositories.</CardDescription>
      </CardHeader>
      <CardContent>
        <RepoTimeline repos={repos} />
      </CardContent>
    </Card>
  );
}

async function PinnedSection({
  projectsPromise,
}: {
  projectsPromise: Promise<GithubRepoCard[]>;
}) {
  const projects = await projectsPromise;

  return (
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
  );
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = (await searchParams) ?? {};
  const requestedUsername = getUsernameParam(params.username);
  const isValidRequestedUsername =
    requestedUsername.length > 0 && USERNAME_PATTERN.test(requestedUsername);
  const username = isValidRequestedUsername
    ? requestedUsername
    : DEFAULT_GITHUB_USERNAME;

  const profilePromise = getGithubProfile(username);
  const statsPromise = getGithubStats(username);
  const activityPromise = getGithubHeatmap(username);
  const languagesPromise = getGithubLanguageBreakdown(username);
  const reposPromise = getGithubRecentRepos(username);
  const projectsPromise = getGithubPinnedProjects(username);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 md:px-8 md:py-10">
      <DashboardUsernameSearch activeUsername={username} />

      {requestedUsername.length > 0 && !isValidRequestedUsername ? (
        <Card className="border-dashed p-4">
          <p className="text-sm text-(--muted)">
            &quot;{requestedUsername}&quot; is not a valid GitHub username. Showing
            @{username} instead.
          </p>
        </Card>
      ) : null}

      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileSection profilePromise={profilePromise} />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection statsPromise={statsPromise} />
      </Suspense>

      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<PanelSkeleton />}>
          <ActivitySection activityPromise={activityPromise} />
        </Suspense>
        <Suspense fallback={<PanelSkeleton />}>
          <LanguageSection languagesPromise={languagesPromise} />
        </Suspense>
      </div>

      <Suspense fallback={<TimelineSkeleton />}>
        <TimelineSection reposPromise={reposPromise} />
      </Suspense>

      <Suspense fallback={<PanelSkeleton />}>
        <PinnedSection projectsPromise={projectsPromise} />
      </Suspense>
    </div>
  );
}
