# RevenuePulse AI — Funnels Dashboard

Pixel-close recreation of the "Funnels" page from a SaaS analytics dashboard
reference screenshot. Static mock data only — no backend.

## Stack

Vite + React 19 + TypeScript, Tailwind CSS 4 (design tokens in
`src/index.css`), `lucide-react` icons, `recharts` for the trend chart and
sparklines, `@fontsource/inter` for a self-hosted Inter font. Vitest +
React Testing Library for tests, oxlint for linting.

## Install & run

```bash
npm install
npm run dev       # dev server
npm run build     # type-check + production build
npm run preview   # preview the production build
npm run lint       # oxlint
npm run test       # vitest run
```

## Structure

```
src/
  data/funnelsMockData.ts   # all page copy/numbers, transcribed from the reference
  types/funnel.ts           # shared types for the mock data
  lib/formatters.ts         # number/percent formatting, trend color helper
  components/ui/            # generic primitives (Card, Badge, Button, Sparkline, ...)
  components/layout/        # AppShell, Sidebar, TopBar
  components/funnels/       # page-specific sections (KPI row, funnel card, charts, ...)
  pages/FunnelsPage.tsx      # assembles the sections
tests/
  FunnelsPage.smoke.test.tsx
```
