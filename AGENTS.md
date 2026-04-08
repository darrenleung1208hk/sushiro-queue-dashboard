# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

This repo ships a queue-first dashboard for Sushiro Hong Kong.

The user-facing product is the localized queue dashboard at `app/[locale]/dashboard/page.tsx`, backed by `GET /api/queues`. The route builds a normalized queue snapshot from external Sushiro APIs and supports explicit degraded states.

## Architecture

```text
Browser
  -> app/[locale]/dashboard/page.tsx
    -> GET /api/queues
      -> lib/live-stores.ts
        -> store list API
        -> queue API per branch
      -> lib/queue-snapshot.ts
      -> lib/queue-items.ts
      -> lib/queue-recommendations.ts
```

## Queue Contract

`GET /api/queues` is the primary app contract. Keep it stable.

```ts
interface QueueApiResponse {
  status: 'success' | 'partial' | 'unavailable';
  updatedAt: string;
  data: QueueItem[];
  recommended: QueueItem[];
  groups: QueueGroups;
  warnings: string[];
  partialData: boolean;
  errorCode?: string;
  meta: {
    totalStores: number;
    successfulQueueFetches: number;
    failedQueueFetches: number;
  };
}
```

Rules:

- Always return the same top-level shape from `GET /api/queues`.
- Use `status` to distinguish usable, degraded, and unavailable snapshots.
- Use `partial` when branch metadata exists but some queue requests fail.
- Use `unavailable` only when the route cannot produce a usable branch snapshot.
- Keep route handlers thin and push deterministic logic into `lib/`.

## Recommendation Rules

- Recommendation ranking lives in `lib/queue-recommendations.ts`.
- Queue normalization lives in `lib/queue-items.ts`.
- Cluster mapping lives in `lib/recommendation-clusters.ts`.
- Recommendations may render in `partial` mode, but they must only use successfully fetched queue data.
- If recommendation behavior changes, update tests and docs in the same change.

## Internationalization

- Supported locales: `en`, `zh-HK`
- All user-facing strings must exist in both locale files.
- Keep locale files valid UTF-8 JSON.
- If you add degraded-state messaging, update both locale files in the same patch.

## Code Conventions

- Use absolute imports with `@/`.
- Use `cn()` for conditional class names.
- Prefer named exports.
- Keep client components focused on rendering and local UI state.
- Move deterministic transforms into `lib/` when they benefit from unit tests.

## Testing

Vitest covers logic-first modules only.

Good candidates for tests:

- queue normalization
- response shaping
- recommendation ranking
- grouping behavior
- degraded-state contract logic

Out of scope for the current setup:

- browser or E2E tests
- component rendering tests
- hook rendering tests

## Change Discipline

- Update `README.md` when product behavior or public contracts change.
- Update `AGENTS.md` when architecture boundaries or maintenance rules change.
- Do not add new queue response fields without documenting them.
- Do not silently change `status` semantics.
