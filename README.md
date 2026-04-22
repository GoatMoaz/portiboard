# PortiBoard

PortiBoard is a developer portfolio platform that combines:

- A marketing-quality landing experience
- A live GitHub activity dashboard
- An MDX blog with generated metadata and Open Graph images
- A curated uses stack page

The project is built with Next.js App Router and focuses on production-minded patterns: typed routes, server-first data loading, streaming UI, resilient fallbacks, and polished motion.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Features](#core-features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Available Scripts](#available-scripts)
8. [Routes and Pages](#routes-and-pages)
9. [API Reference](#api-reference)
10. [Project Structure](#project-structure)
11. [Contribution Guide](#contribution-guide)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)
14. [Quality and Performance Checklist](#quality-and-performance-checklist)
15. [Project Status](#project-status)
16. [License](#license)

## Project Overview

PortiBoard is designed to answer one practical question:

How can a personal portfolio behave like a real product?

Instead of static profile sections, it uses live GitHub signals, interactive dashboards, and technical writing as a combined narrative.

Key goals:

- Show recent engineering activity, not just static claims
- Balance visual quality with maintainable architecture
- Keep pages fast and resilient when external APIs fail
- Build with reusable patterns that can evolve into a real SaaS foundation

## Core Features

### 1. Marketing Landing Page

- Rich hero section with live GitHub profile and stat strip
- Animated feature narratives for dashboard capabilities
- Responsive layout with intentional motion and visual depth
- Direct pathways to Dashboard, Blog, and Uses

### 2. Live Activity Dashboard

- URL-driven username view (`?username=`)
- Debounced username search input with GitHub username validation
- Streaming sections with independent `Suspense` boundaries
- Stats, contribution insights, language analytics, recent timeline, and pinned projects
- Crossfilter interactions:
  - Week filter
  - Weekday filter
  - Language filter

### 3. Blog and Content System

- MDX-based posts from `content/posts`
- Static route generation for post slugs
- Reading time and heading extraction
- Desktop table of contents on post pages
- Syntax highlighting with Prism

### 4. Uses Page

- Curated tool stack with rationale for each tool
- Responsive grid with staggered entrance animation
- Devicon asset integration via remote images

### 5. Navigation and Theme Experience

- Sticky desktop navbar and floating mobile navbar
- Container-measured active indicators (no `layoutId` scroll-origin jump)
- Theme switch with `next-themes`

### 6. API Layer

- `GET /api/github/[username]`
  - Validates username input
  - Supports partial views
  - Returns normalized dashboard data
  - Uses caching headers

## Tech Stack

### Application

- Next.js 16 (App Router, Server Components, Route Handlers)
- React 19
- TypeScript (strict mode)
- Tailwind CSS v4

### UI, Motion, and Charts

- Framer Motion
- Recharts
- Lucide React icons
- next-themes

### Content and Markdown

- next-mdx-remote (RSC)
- gray-matter
- reading-time
- remark-gfm
- rehype-slug
- rehype-prism-plus

### Tooling

- ESLint 9 + Next core-web-vitals config
- Prettier
- Typed routes enabled in Next config

### External Data Sources

- GitHub REST API
- GitHub GraphQL API (when token is available)
- GitHub contribution markup fallback for heatmap resilience

## Architecture

### Server-first data loading

- Data fetching is centralized in `lib/github.ts`.
- Dashboard pages fetch data server-side and stream sections independently.
- Interactive chart logic lives in client components, while data contracts remain typed.

### Streaming layout strategy

- Dashboard sections are split into focused async blocks.
- Each block has its own skeleton fallback.
- Slow GitHub calls in one section do not freeze the entire page.

### GitHub data strategy and fallbacks

For contribution heatmaps, PortiBoard follows a resilient chain:

1. GraphQL contribution calendar (if `GITHUB_TOKEN` exists)
2. Public contribution HTML parsing fallback
3. Public events-based fallback

This keeps the dashboard functional across rate limits or partial API constraints.

### Caching model

- GitHub fetches use `next.revalidate = 3600`
- API response cache header:
  - `s-maxage=3600`
  - `stale-while-revalidate=86400`

### Accessibility and motion

- Reduced-motion preferences are respected through a shared motion hook.
- Scroll-triggered animations are guarded by intersection thresholds and `once` behavior.
- Interactive elements preserve keyboard accessibility and visible focus states.

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer

### 1. Clone the repository

```bash
git clone <your-fork-or-repo-url>
cd portiboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env.local` file in the project root.

```bash
# Default profile rendered by the app
GITHUB_USERNAME=vercel

# Optional but highly recommended for better GitHub API limits
GITHUB_TOKEN=
```

### 4. Start development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GITHUB_USERNAME` | Yes | Default GitHub username used across pages |
| `GITHUB_TOKEN` | No | Raises API limits and enables GraphQL contribution calendar |

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npm run format` | Format codebase with Prettier |
| `npm run format:check` | Verify formatting without writing changes |

Recommended pre-PR checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Routes and Pages

| Route | Purpose |
| --- | --- |
| `/` | Marketing landing page with live profile snapshot |
| `/dashboard` | Main analytics view with search and crossfilters |
| `/blog` | List of technical posts |
| `/blog/[slug]` | Individual post page with metadata and ToC |
| `/uses` | Tools and workflow page |
| `/api/github/[username]` | Normalized GitHub data endpoint |

## API Reference

### `GET /api/github/[username]`

Returns normalized dashboard data for a GitHub username.

#### Query Params

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `view` | string | `all` | Partial response selector |

Supported `view` values:

- `all`
- `stats`
- `languages`
- `recent`
- `heatmap`
- `pinned`
- `profile`

#### Success response shape

```json
{
  "username": "vercel",
  "view": "all",
  "fetchedAt": "2026-04-22T12:00:00.000Z",
  "data": {}
}
```

#### Error behavior

- `400`: invalid GitHub username pattern
- `502`: upstream fetch failed

## Project Structure

```text
app/
  (marketing)/
  dashboard/
  blog/
  uses/
  api/
components/
  dashboard/
  blog/
  layout/
  marketing/
  motion/
  ui/
content/
  posts/
hooks/
lib/
public/
```

Key implementation files:

- `app/(marketing)/page.tsx`: landing experience
- `app/dashboard/page.tsx`: streamed dashboard composition
- `components/dashboard/username-search.tsx`: debounced query-param search
- `components/dashboard/insights-crossfilter.tsx`: chart interaction orchestration
- `components/dashboard/activity-insights.tsx`: weekly and weekday analytics
- `components/dashboard/donut-chart.tsx`: language slice visualization
- `components/dashboard/repo-timeline.tsx`: animated recent push timeline
- `components/layout/navbar.tsx`: desktop navigation with measured active indicator
- `components/layout/mobile-nav.tsx`: mobile nav with measured active indicators
- `lib/github.ts`: GitHub integrations, normalization, and fallback logic
- `lib/mdx.ts`: post parsing, heading extraction, and MDX compilation

## Contribution Guide

Contributions are welcome for final polish, bug fixes, and quality improvements.

### Typical workflow

1. Fork the repository
2. Create a branch
3. Make focused changes
4. Run quality checks
5. Open a pull request

```bash
git checkout -b feat/your-feature-name
```

### Pull Request checklist

- Scope is focused and well-described
- Lint, type check, and build pass
- Responsive behavior verified (mobile, tablet, desktop)
- Reduced-motion behavior is still respected
- README is updated when behavior changes

### Coding conventions

- Prefer server-side fetching for non-interactive data
- Keep visual interaction logic in client components
- Preserve strict TypeScript types across boundaries
- Avoid layout animation patterns that break on scroll

## Deployment

### Vercel

1. Push repository to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Self-hosted Node

```bash
npm install
npm run build
npm run start
```

## Troubleshooting

### GitHub rate limits

- Set `GITHUB_TOKEN` to improve reliability and unlock GraphQL contribution data.

### Invalid username fallback on dashboard

- Dashboard validates username query params.
- Invalid values show a warning and fallback to the default configured user.

### Remote image loading issues

- Allowed hosts are defined in `next.config.ts` under `images.remotePatterns`.
- Current allowed hosts include GitHub avatars and jsDelivr.

### Browser icon not updating

- Browser favicons are aggressively cached.
- Hard refresh once after icon changes.

## Quality and Performance Checklist

Before release:

1. Run `npm run lint`
2. Run `npx tsc --noEmit`
3. Run `npm run build`
4. Validate landing, dashboard, and at least one blog post route
5. Verify reduced motion behavior in system settings
6. Run Lighthouse on `/`, `/dashboard`, and `/blog/[slug]`

Target profile:

- Lighthouse Performance: 90+
- Lighthouse Accessibility: 95+

## Project Status

PortiBoard is in a feature-complete candidate stage.

Current focus areas:

- Final UX polish and copy refinement
- Final QA across browsers and devices
- Documentation completeness for contributors

## License

PortiBoard is licensed under the MIT License.