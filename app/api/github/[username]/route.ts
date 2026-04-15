import { NextResponse, type NextRequest } from "next/server";
import {
  getGithubViewData,
  isGithubDashboardView,
  type GithubDashboardView,
} from "@/lib/github";

const USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

function validateUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> },
) {
  const { username } = await context.params;

  if (!validateUsername(username)) {
    return NextResponse.json(
      { error: "Invalid GitHub username." },
      {
        status: 400,
      },
    );
  }

  const requestedView = request.nextUrl.searchParams.get("view");
  const view: GithubDashboardView = isGithubDashboardView(requestedView)
    ? requestedView
    : "all";

  try {
    const data = await getGithubViewData(username, view);

    return NextResponse.json(
      {
        username,
        view,
        fetchedAt: new Date().toISOString(),
        data,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch GitHub data.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 502,
      },
    );
  }
}
