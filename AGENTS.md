# AGENTS.md

Guidance for AI coding agents working in this repository.

---

## Project Overview

Real-time dashboard for monitoring Sushiro restaurant queue status across Hong Kong locations. The app polls a BFF API route that proxies Sushiro's external APIs and displays live queue data with filtering, statistics, and dual-language support.

**Tech stack:** Next.js 15 (App Router) · TypeScript 5.8 (strict) · Tailwind CSS 3.4 · shadcn/ui · Radix UI · Recharts · next-intl · next-themes · Sonner · React Hook Form + Zod

---

## Architecture

```
Browser (polls every 60s)
  └─> app/[locale]/dashboard/page.tsx   (client component)
        └─> GET /api/stores/live         (Next.js Route Handler / BFF)
              ├─> CORS proxy → Sushiro store list API  (cache: 30s)
              └─> CORS proxy → Sushiro queue API × N   (cache: 15s, concurrency: 5)
```

- All pages live under `app/[locale]/` — the `[locale]` segment is always present (`en` or `zh-HK`).
- `middleware.ts` uses `next-intl/middleware` with an always-prefix strategy for locale routing.
- The dashboard page is a `"use client"` component that uses `setInterval` + a `useRef` guard to prevent concurrent fetches.
- There is one API endpoint: `app/api/stores/live/route.ts`.

---

## Environment Variables

Required in `.env.local` for live data:

| Variable                 | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `CORS_PROXY_URL`         | CORS proxy base URL for all external API calls |
| `SUSHIRO_STORE_LIST_API` | Sushiro store list API endpoint                |
| `SUSHIRO_QUEUE_API`      | Sushiro queue data API endpoint                |

---

## Key Data Types

Defined in `lib/types.ts` and `lib/constants.ts`.

```typescript
// Core store shape
interface Store {
  shopId: number;
  storeStatus: 'OPEN' | 'CLOSED' | 'BUSY' | 'MAINTENANCE';
  waitingGroup: number; // number of waiting groups
  storeQueue: string[]; // current queue ticket numbers (e.g. "8312", "8330-1")
  timestamp: Date;
  name: string; // Chinese store name
  nameEn: string; // English store name
  address: string;
  region: string; // '香港島' | '九龍' | '新界'
  area: string; // district (e.g. '油尖旺區')
  latitude?: number;
  longitude?: number;
}

// Queue priority thresholds
QUEUE_PRIORITY.LOW; // 0–20 waiting groups
QUEUE_PRIORITY.MEDIUM; // 21–50
QUEUE_PRIORITY.HIGH; // 51–100
QUEUE_PRIORITY.EXTREME; // 100+
```

---

## File Organization

| Location                                | Purpose                                           |
| --------------------------------------- | ------------------------------------------------- |
| `app/[locale]/dashboard/_components/`   | Dashboard-specific, non-routable components       |
| `components/ui/`                        | Shared shadcn/ui components                       |
| `components/`                           | Other shared components (e.g. `LanguageSwitcher`) |
| `lib/hooks/`                            | Custom React hooks                                |
| `lib/types.ts`                          | All TypeScript interfaces and type aliases        |
| `lib/constants.ts`                      | App-wide constants (`QUEUE_PRIORITY`, etc.)       |
| `lib/utils.ts`                          | Utility functions — includes `cn()`               |
| `locales/en.json`, `locales/zh-HK.json` | i18n translation strings                          |
| `app/api/stores/live/route.ts`          | The only API route                                |

Place page-co-located components in `_components/` folders. Place reusable UI primitives in `components/ui/`. Do not create new top-level folders without a clear reason.

---

## Code Conventions

### Tailwind class names — always use `cn()`

Import `cn` from `@/lib/utils` for **all** conditional or merged class logic. Never use string concatenation or template literals for Tailwind classes.

```typescript
// CORRECT
import { cn } from '@/lib/utils';
const cls = cn('px-4 py-2', isActive && 'bg-primary text-primary-foreground');

// WRONG
const cls = 'px-4 py-2 ' + (isActive ? 'bg-primary' : '');
const cls = `px-4 py-2 ${isActive ? 'bg-primary' : ''}`;
```

### Tailwind tokens — use semantic values

Use design tokens (`primary`, `muted`, `card`, `border`, `destructive`, etc.) rather than raw Tailwind color values (`blue-500`, `gray-200`, etc.).

### Imports

- Use absolute imports with the `@/` prefix throughout.
- Group order: React → external libraries → internal components → types.
- Use **named exports** for all components and utilities.

### React patterns

- Functional components with hooks only.
- Use `useMemo` and `useCallback` for expensive computations and stable callbacks.
- Provide correct dependency arrays in `useEffect`/`useCallback`/`useMemo`.
- Use TypeScript interfaces for all props and state shapes.

### Card styling baseline

```typescript
'border border-border shadow-sm bg-card'; // default card
'hover:shadow-lg transition-all duration-300'; // interactive card
```

---

## Internationalization

- Library: `next-intl` 4.x
- Supported locales: `en`, `zh-HK`
- Translation files: `locales/en.json`, `locales/zh-HK.json`
- Config: `i18n/request.ts`
- All user-facing strings must have entries in both locale files.

---

## Git Workflow

### Branches

```
main       ← production-ready only
└─ develop ← integration branch
   ├─ feature/<descriptive-name>
   └─ fix/<issue-description>
```

Always branch from `develop`. Never commit directly to `main` or `develop`.

```bash
git checkout develop && git pull origin develop
git checkout -b feature/your-feature-name
```

### Commit messages — Conventional Commits

Format: `<type>: <description>`

- No scope, no body, no footer.
- Lowercase first letter, no trailing period, present/imperative tense.

| Type       | When to use                     |
| ---------- | ------------------------------- |
| `feat`     | New feature                     |
| `fix`      | Bug fix                         |
| `docs`     | Documentation only              |
| `style`    | Formatting, no logic change     |
| `refactor` | Restructure without feature/fix |
| `perf`     | Performance improvement         |
| `test`     | Tests                           |
| `chore`    | Build, tooling, dependencies    |

Examples:

```
feat: add store search functionality
fix: resolve queue number display issue
refactor: extract store card component
chore: update dependencies
```

### Pre-commit hooks

Husky runs ESLint + Prettier + Commitlint on every commit. Fix all lint errors before committing (`npm run lint`).

---

## Dev Scripts

```bash
npm run dev        # start development server (localhost:3000)
npm run build      # production build
npm run start      # start production server
npm run lint       # ESLint check
npm run type-check # TypeScript check (no emit)
```

---

## What NOT to Do

- Do not commit directly to `main` or `develop`.
- Do not use non-conventional commit messages (no scope, no body, lowercase, no period).
- Do not use string concatenation or template literals for Tailwind class names — use `cn()`.
- Do not use raw Tailwind color values — use semantic design tokens.
- Do not use default exports for components.
- Do not add new routes outside the `app/[locale]/` structure.
- Do not add user-facing strings without corresponding entries in both `locales/en.json` and `locales/zh-HK.json`.
- Do not ignore ESLint or TypeScript errors.
