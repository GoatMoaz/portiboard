# PortiBoard

PortiBoard is a production-grade developer portfolio and activity dashboard built with Next.js App Router.

It combines a marketing landing page, a live GitHub activity dashboard, an MDX-powered blog, and a personal tools/stack page with optimistic UI interactions.

## Tech Stack

- Next.js 16 (App Router, Server Components, Route Handlers)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Recharts
- next-themes
- next-mdx-remote (RSC)
- GitHub REST API

## Features

- Hero landing page at `/` with typing role animation and animated grid atmosphere
- Streaming dashboard at `/dashboard` with independent Suspense boundaries:
  - GitHub heatmap (animated SVG)
  - Language donut chart
  - Recent repo timeline
  - Count-up stats strip
  - Pinned project spotlight
- MDX blog at `/blog` and `/blog/[slug]`:
  - Static params generation
  - Reading time
  - Desktop ToC sidebar
  - Prism syntax highlighting
- Uses page at `/uses`:
  - Devicon-based tool list
  - Slide-up stagger animation
  - Optimistic "currently learning" toggles persisted in localStorage
- API routes:
  - `GET /api/github/[username]` normalized GitHub proxy data with cache headers
  - `GET /api/og` dynamic Open Graph image generation via `next/og`

## Architecture Decisions

1. Data fetching boundaries

- GitHub fetching is done in server-side code (`lib/github.ts`) and consumed by async server components.
- Interactive visualization and motion are isolated in client components under `app/dashboard/components`.

2. Streaming dashboard

- Dashboard sections are split into independent async server sections and wrapped in `Suspense` with skeleton fallbacks.
- One slow section does not block others.

3. API proxy and caching

- `app/api/github/[username]/route.ts` centralizes normalization and sets:
  - `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`

4. Motion and accessibility

- A custom reduced-motion hook (`hooks/use-reduced-motion.ts`) is used across motion-heavy components.
- Section entrances are triggered with a custom Intersection Observer hook (`hooks/use-in-view.ts`).

5. Content system

- MDX posts are read from `content/posts` via `lib/mdx.ts`.
- Blog pages are statically generated via `generateStaticParams`.

## Folder Highlights

- `app/(marketing)/page.tsx`: hero landing page
- `app/dashboard/page.tsx`: dashboard shell and streaming boundaries
- `app/blog/page.tsx`: post list
- `app/blog/[slug]/page.tsx`: post detail with ToC
- `app/uses/page.tsx`: tools page
- `app/api/github/[username]/route.ts`: GitHub proxy route
- `app/api/og/route.tsx`: dynamic OG generation
- `hooks/use-count-up.ts`: requestAnimationFrame count-up hook
- `hooks/use-in-view.ts`: custom Intersection Observer hook
- `hooks/use-reduced-motion.ts`: reduced-motion utility
- `lib/github.ts`: typed GitHub API helpers and normalization
- `lib/mdx.ts`: MDX parsing/compilation helpers

## Environment Variables

Create a `.env.local` file in the project root.

```bash
# Required for selecting which GitHub profile to render by default
GITHUB_USERNAME=vercel

# Optional. If set, raises GitHub API rate limits.
GITHUB_TOKEN=

# Optional absolute URL (used for metadata/OG URL building)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Local Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Quality checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Import project into Vercel.
3. Add environment variables from the section above.
4. Deploy.

## Performance and Accessibility Goals

- Lighthouse target:
  - Performance: 90+
  - Accessibility: 95+

Recommended checks after deployment:

1. Run Lighthouse on `/`, `/dashboard`, and one `/blog/[slug]` page.
2. Verify reduced motion behavior with OS-level setting enabled.
3. Validate responsive behavior at mobile, md, and lg breakpoints.
