# Sushiro Queue Dashboard

A Next.js dashboard for tracking Sushiro Hong Kong branch queues in near real time.

The app fetches branch metadata and queue information from Sushiro APIs through a server-side BFF route, normalizes the result into a stable queue snapshot, and renders:

- recommended branches to try first
- grouped queue states
- explicit success, partial, and unavailable states
- bilingual UI in English and Traditional Chinese (Hong Kong)

## Current Product Scope

- Queue-first dashboard under `app/[locale]/dashboard/page.tsx`
- Recommendation list based on live queue counts plus branch clustering
- Automatic refresh every 30 seconds
- Graceful degraded mode when some queue requests fail
- Locale-prefixed routing for `en` and `zh-HK`

## Tech Stack

- Next.js 15 App Router
- TypeScript 5.8
- Tailwind CSS
- shadcn/ui
- next-intl
- Vitest

## Getting Started

1. Install dependencies.

```bash
npm install
```

2. Create `.env.local`.

```bash
CORS_PROXY_URL=...
SUSHIRO_STORE_LIST_API=...
SUSHIRO_QUEUE_API=...
```

3. Start the app.

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Queue Snapshot Contract

The dashboard consumes `GET /api/queues`.

The route always returns the same JSON shape:

```ts
type QueueSnapshotStatus = 'success' | 'partial' | 'unavailable';

interface QueueApiResponse {
  status: QueueSnapshotStatus;
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

Status semantics:

- `success`: branch metadata and queue data were fetched for all branches in scope
- `partial`: branch metadata exists, but one or more branch queue requests failed or returned unavailable data
- `unavailable`: the app could not build a usable branch snapshot

HTTP semantics:

- `200 OK`: `success`
- `206 Partial Content`: `partial`
- `503 Service Unavailable`: `unavailable`

## Data Flow

1. `lib/live-stores.ts` fetches the store list and per-branch queue data.
2. `lib/queue-snapshot.ts` converts that result into the normalized queue snapshot contract.
3. `lib/queue-items.ts` normalizes queue counts and recommendation eligibility.
4. `lib/queue-recommendations.ts` selects up to three recommended branches.
5. `app/[locale]/dashboard/page.tsx` renders the snapshot, including degraded-state messaging.

## Recommendation Logic

Recommendations currently:

- include only `IMMEDIATE` and `WAITING` queue items
- prefer the best branch inside the anchor cluster
- fall back to adjacent clusters
- then fall back to the remaining eligible global pool
- cap the list at 3 branches

This keeps the recommendations deterministic and testable without needing persistence or personalization.

## Project Structure

```text
app/
  api/queues/route.ts          # queue snapshot BFF route
  api/stores/live/route.ts     # raw live stores route
  [locale]/dashboard/page.tsx  # queue dashboard
lib/
  live-stores.ts               # fetch external store and queue data
  queue-snapshot.ts            # normalized queue snapshot builder
  queue-items.ts               # queue normalization and ordering
  queue-recommendations.ts     # recommendation ranking
  recommendation-clusters.ts   # branch cluster mapping
locales/
  en.json
  zh-HK.json
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run type-check`
- `npm run test:run`

## Testing

Vitest covers logic-first modules under `lib/`, including:

- queue item normalization
- queue grouping
- recommendation cluster mapping
- recommendation ranking
- queue snapshot contract states

## Notes

- The dashboard can still render useful results in `partial` mode.
- Recommendations in `partial` mode are based only on queue data that was successfully fetched.
- `zh-HK` locale content should stay UTF-8 encoded to avoid text corruption.
