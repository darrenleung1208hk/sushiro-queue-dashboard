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

Public request interface:

- `preferredBranch=<shopId>` accepts an optional positive integer branch id
- `preferredCluster=<clusterId>` accepts an optional `RecommendationCluster`
- Query params are the source of truth for recommendation preference input
- Backend resolution is authoritative: route parsing and snapshot building decide whether the active mode is `branch`, `cluster`, or `auto`

```ts
interface QueueApiResponse {
  status: 'success' | 'partial' | 'unavailable';
  updatedAt: string;
  data: QueueItem[];
  recommended: RecommendedQueueItem[];
  groups: QueueGroups;
  warnings: string[];
  partialData: boolean;
  errorCode?: string;
  meta: {
    totalStores: number;
    successfulQueueFetches: number;
    failedQueueFetches: number;
  };
  preferences: {
    requestedBranchShopId?: number;
    requestedCluster?: RecommendationCluster;
    activeMode: 'branch' | 'cluster' | 'auto';
    activeBranchShopId?: number;
    activeCluster?: RecommendationCluster;
    fallbackReasonCode?:
      | 'PREFERRED_BRANCH_NOT_FOUND'
      | 'PREFERRED_BRANCH_INELIGIBLE'
      | 'PREFERRED_CLUSTER_UNAVAILABLE';
    branchOptions: RecommendationBranchOption[];
    clusterOptions: RecommendationCluster[];
  };
}
```

Rules:

- Always return the same top-level shape from `GET /api/queues`.
- Use `status` to distinguish usable, degraded, and unavailable snapshots.
- Use `partial` when branch metadata exists but some queue requests fail.
- Use `unavailable` only when the route cannot produce a usable branch snapshot.
- Keep route handlers thin and push deterministic logic into `lib/`.
- Do not make the frontend infer active preference mode from raw query params. Use `response.preferences` as the public backend decision.

## Recommendation Rules

- Recommendation ranking lives in `lib/queue-recommendations.ts`.
- Preference parsing and fallback resolution live in `lib/recommendation-preferences.ts`.
- Queue normalization lives in `lib/queue-items.ts`.
- Cluster mapping lives in `lib/recommendation-clusters.ts`.
- Recommendations may render in `partial` mode because ranking uses the normalized branch snapshot, not queue-fetch success alone.
- Supported precedence is `preferred branch > preferred cluster > auto`.
- If a preferred branch is invalid or ineligible, fall back to cluster when possible; otherwise fall back to auto.
- If a preferred cluster has no eligible candidates, fall back to auto and surface that via `preferences.fallbackReasonCode`.
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
