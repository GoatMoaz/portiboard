import { cache } from "react";

const GITHUB_API_BASE_URL = "https://api.github.com";
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const GITHUB_WEB_BASE_URL = "https://github.com";
const GITHUB_REVALIDATE_SECONDS = 3600;

export type GithubDashboardView =
  | "all"
  | "stats"
  | "languages"
  | "recent"
  | "heatmap"
  | "pinned"
  | "profile";

type GithubUserResponse = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
};

type GithubRepoResponse = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
  updated_at: string;
  fork: boolean;
  size: number;
};

type GithubEventResponse = {
  type: string;
  created_at: string;
  payload?: {
    commits?: Array<{ sha: string }>;
  };
};

type GithubContributionCalendarResponse = {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: Array<{
            contributionDays: Array<{
              contributionCount: number;
              date: string;
            }>;
          }>;
        };
      };
    } | null;
  };
  errors?: Array<{ message: string }>;
};

export type GithubProfile = {
  username: string;
  displayName: string;
  avatarUrl: string;
  profileUrl: string;
  bio: string;
};

export type GithubStats = {
  publicRepos: number;
  totalStars: number;
  followers: number;
  following: number;
};

export type GithubLanguageSlice = {
  name: string;
  value: number;
  percentage: number;
  color: string;
};

export type GithubRepoCard = {
  id: number;
  name: string;
  description: string;
  stars: number;
  language: string;
  pushedAt: string;
  repoUrl: string;
};

export type GithubHeatmapCell = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type GithubDashboardData = {
  profile: GithubProfile;
  stats: GithubStats;
  languages: GithubLanguageSlice[];
  recentRepos: GithubRepoCard[];
  pinnedProjects: GithubRepoCard[];
  heatmap: GithubHeatmapCell[];
};

export type GithubViewDataMap = {
  all: GithubDashboardData;
  stats: GithubStats;
  languages: GithubLanguageSlice[];
  recent: GithubRepoCard[];
  heatmap: GithubHeatmapCell[];
  pinned: GithubRepoCard[];
  profile: GithubProfile;
};

const viewSet = new Set<GithubDashboardView>([
  "all",
  "stats",
  "languages",
  "recent",
  "heatmap",
  "pinned",
  "profile",
]);

const languageColorMap: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#DEA584",
  HTML: "#E34F26",
  CSS: "#563D7C",
  Java: "#B07219",
  C: "#555555",
  "C++": "#F34B7D",
  Shell: "#89E051",
};

function buildGithubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function githubFetch<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${GITHUB_API_BASE_URL}${path}`, {
    headers: buildGithubHeaders(),
    next: {
      revalidate: GITHUB_REVALIDATE_SECONDS,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed for ${path}: ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

async function githubGraphqlFetch<TResponse>(
  query: string,
  variables: Record<string, unknown>,
): Promise<TResponse> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("A GitHub token is required for GraphQL requests.");
  }

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      ...buildGithubHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    next: {
      revalidate: GITHUB_REVALIDATE_SECONDS,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed: ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

async function githubWebFetchText(path: string): Promise<string> {
  const response = await fetch(`${GITHUB_WEB_BASE_URL}${path}`, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "PortiBoard",
    },
    next: {
      revalidate: GITHUB_REVALIDATE_SECONDS,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub web request failed for ${path}: ${response.status}`);
  }

  return response.text();
}

const getGithubUser = cache(async (username: string): Promise<GithubUserResponse> => {
  return githubFetch<GithubUserResponse>(`/users/${username}`);
});

const getGithubRepos = cache(async (username: string): Promise<GithubRepoResponse[]> => {
  return githubFetch<GithubRepoResponse[]>(
    `/users/${username}/repos?sort=pushed&direction=desc&per_page=100`,
  );
});

const getGithubEvents = cache(async (username: string): Promise<GithubEventResponse[]> => {
  const pages = Array.from({ length: 5 }, (_, index) => index + 1);

  const responses = await Promise.all(
    pages.map(async (page) => {
      try {
        return await githubFetch<GithubEventResponse[]>(
          `/users/${username}/events/public?per_page=100&page=${page}`,
        );
      } catch {
        return [] as GithubEventResponse[];
      }
    }),
  );

  return responses.flat();
});

function toIsoDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function makeYearRange(): string[] {
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const dates: string[] = [];

  for (let index = 364; index >= 0; index -= 1) {
    const day = new Date(today);
    day.setUTCDate(today.getUTCDate() - index);
    dates.push(toIsoDate(day));
  }

  return dates;
}

function contributionQueryRange(yearRange: string[]) {
  return {
    from: `${yearRange[0]}T00:00:00Z`,
    to: `${yearRange[yearRange.length - 1]}T23:59:59Z`,
  };
}

function levelFromCount(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0 || maxCount === 0) {
    return 0;
  }

  const ratio = count / maxCount;

  if (ratio < 0.25) {
    return 1;
  }

  if (ratio < 0.5) {
    return 2;
  }

  if (ratio < 0.75) {
    return 3;
  }

  return 4;
}

function normalizeRepo(repo: GithubRepoResponse): GithubRepoCard {
  return {
    id: repo.id,
    name: repo.name,
    description: repo.description ?? "No description provided.",
    stars: repo.stargazers_count,
    language: repo.language ?? "Unknown",
    pushedAt: repo.pushed_at,
    repoUrl: repo.html_url,
  };
}

function colorForLanguage(language: string): string {
  if (languageColorMap[language]) {
    return languageColorMap[language];
  }

  const hash = language
    .split("")
    .reduce((acc, character) => acc + character.charCodeAt(0), 0);
  const hue = hash % 360;

  return `hsl(${hue} 70% 55%)`;
}

function parseContributionMarkup(markup: string): Map<string, number> {
  const counts = new Map<string, number>();
  const dayPattern =
    /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-count="(\d+)"|data-count="(\d+)"[^>]*data-date="(\d{4}-\d{2}-\d{2})"/g;

  for (const match of markup.matchAll(dayPattern)) {
    const date = match[1] ?? match[4];
    const count = match[2] ?? match[3];

    if (!date || !count) {
      continue;
    }

    counts.set(date, Number.parseInt(count, 10));
  }

  return counts;
}

function contributionWeight(event: GithubEventResponse): number {
  if (event.type === "PushEvent") {
    return Math.max(event.payload?.commits?.length ?? 1, 1);
  }

  if (
    event.type === "PullRequestEvent" ||
    event.type === "IssuesEvent" ||
    event.type === "IssueCommentEvent" ||
    event.type === "CreateEvent" ||
    event.type === "DeleteEvent" ||
    event.type === "ForkEvent" ||
    event.type === "WatchEvent" ||
    event.type === "ReleaseEvent"
  ) {
    return 1;
  }

  return 0;
}

const getGithubContributionCalendar = cache(
  async (username: string, from: string, to: string): Promise<Map<string, number>> => {
    const response = await githubGraphqlFetch<GithubContributionCalendarResponse>(
      `
        query ContributionCalendar($username: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $username) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                weeks {
                  contributionDays {
                    contributionCount
                    date
                  }
                }
              }
            }
          }
        }
      `,
      {
        username,
        from,
        to,
      },
    );

    if (response.errors?.length) {
      throw new Error(response.errors[0]?.message ?? "Unable to load contributions.");
    }

    const days =
      response.data?.user?.contributionsCollection.contributionCalendar.weeks.flatMap(
        (week) => week.contributionDays,
      ) ?? [];

    return new Map(days.map((day) => [day.date, day.contributionCount] as const));
  },
);

const getGithubPublicContributionCalendar = cache(
  async (username: string, yearRange: string[]): Promise<Map<string, number>> => {
    const from = yearRange[0];
    const to = yearRange[yearRange.length - 1];
    const markup = await githubWebFetchText(
      `/users/${username}/contributions?from=${from}&to=${to}`,
    );

    return parseContributionMarkup(markup);
  },
);

function contributionCountsFromEvents(
  events: GithubEventResponse[],
  yearRange: string[],
): Map<string, number> {
  const validDates = new Set(yearRange);
  const countByDate = new Map<string, number>();

  events.forEach((event) => {
    const date = event.created_at.slice(0, 10);

    if (!validDates.has(date)) {
      return;
    }

    const nextValue = (countByDate.get(date) ?? 0) + contributionWeight(event);
    countByDate.set(date, nextValue);
  });

  return countByDate;
}

export function isGithubDashboardView(
  value: string | null,
): value is GithubDashboardView {
  if (!value) {
    return false;
  }

  return viewSet.has(value as GithubDashboardView);
}

export async function getGithubProfile(username: string): Promise<GithubProfile> {
  const user = await getGithubUser(username);

  return {
    username: user.login,
    displayName: user.name ?? user.login,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    bio: user.bio ?? "Building thoughtful products with code.",
  };
}

export async function getGithubStats(username: string): Promise<GithubStats> {
  const [user, repos] = await Promise.all([
    getGithubUser(username),
    getGithubRepos(username),
  ]);

  const totalStars = repos
    .filter((repo) => !repo.fork)
    .reduce((sum, repo) => sum + repo.stargazers_count, 0);

  return {
    publicRepos: user.public_repos,
    totalStars,
    followers: user.followers,
    following: user.following,
  };
}

export async function getGithubLanguageBreakdown(
  username: string,
): Promise<GithubLanguageSlice[]> {
  const repos = await getGithubRepos(username);
  const aggregate = new Map<string, number>();

  repos
    .filter((repo) => !repo.fork && repo.language)
    .forEach((repo) => {
      const language = repo.language as string;
      const weightedSize = Math.max(repo.size, 1);
      aggregate.set(language, (aggregate.get(language) ?? 0) + weightedSize);
    });

  const entries = Array.from(aggregate.entries()).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return [];
  }

  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  return entries.slice(0, 6).map(([name, value]) => {
    const percentage = Number(((value / total) * 100).toFixed(1));

    return {
      name,
      value,
      percentage,
      color: colorForLanguage(name),
    };
  });
}

export async function getGithubRecentRepos(username: string): Promise<GithubRepoCard[]> {
  const repos = await getGithubRepos(username);

  return repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => +new Date(b.pushed_at) - +new Date(a.pushed_at))
    .slice(0, 10)
    .map(normalizeRepo);
}

export async function getGithubPinnedProjects(
  username: string,
): Promise<GithubRepoCard[]> {
  const repos = await getGithubRepos(username);

  return repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }

      return +new Date(b.updated_at) - +new Date(a.updated_at);
    })
    .slice(0, 3)
    .map(normalizeRepo);
}

export async function getGithubHeatmap(username: string): Promise<GithubHeatmapCell[]> {
  const yearRange = makeYearRange();
  const { from, to } = contributionQueryRange(yearRange);
  let countByDate = new Map<string, number>();

  try {
    countByDate = await getGithubContributionCalendar(username, from, to);
  } catch {
    try {
      countByDate = await getGithubPublicContributionCalendar(username, yearRange);
    } catch {
      const events = await getGithubEvents(username);
      countByDate = contributionCountsFromEvents(events, yearRange);
    }
  }

  const counts = yearRange.map((date) => countByDate.get(date) ?? 0);
  const maxCount = Math.max(...counts, 0);

  return yearRange.map((date) => {
    const count = countByDate.get(date) ?? 0;

    return {
      date,
      count,
      level: levelFromCount(count, maxCount),
    };
  });
}

export async function getGithubDashboardData(
  username: string,
): Promise<GithubDashboardData> {
  const [profile, stats, languages, recentRepos, pinnedProjects, heatmap] =
    await Promise.all([
      getGithubProfile(username),
      getGithubStats(username),
      getGithubLanguageBreakdown(username),
      getGithubRecentRepos(username),
      getGithubPinnedProjects(username),
      getGithubHeatmap(username),
    ]);

  return {
    profile,
    stats,
    languages,
    recentRepos,
    pinnedProjects,
    heatmap,
  };
}

export async function getGithubViewData<TView extends GithubDashboardView>(
  username: string,
  view: TView,
): Promise<GithubViewDataMap[TView]> {
  if (view === "stats") {
    return (await getGithubStats(username)) as GithubViewDataMap[TView];
  }

  if (view === "languages") {
    return (await getGithubLanguageBreakdown(username)) as GithubViewDataMap[TView];
  }

  if (view === "recent") {
    return (await getGithubRecentRepos(username)) as GithubViewDataMap[TView];
  }

  if (view === "heatmap") {
    return (await getGithubHeatmap(username)) as GithubViewDataMap[TView];
  }

  if (view === "pinned") {
    return (await getGithubPinnedProjects(username)) as GithubViewDataMap[TView];
  }

  if (view === "profile") {
    return (await getGithubProfile(username)) as GithubViewDataMap[TView];
  }

  return (await getGithubDashboardData(username)) as GithubViewDataMap[TView];
}
