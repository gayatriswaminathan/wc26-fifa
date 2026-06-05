# FIFA Fan App — Architecture
*By the system-analyst, cto-advisor, and ai-engineer.*

## The decision
Build a **web app served from one backend platform** — not full Flutter/iOS. Keep the secrets-safe architecture (the front end is dumb about secrets; one trusted backend holds the key and brokers every external call). Drop the mobile-delivery friction (Flutter SDK, Xcode, $99 Apple account, TestFlight review).

## The platform: Cloudflare (one project)
A single Cloudflare Worker:
- **serves the static app** (index.html / JS / CSS) as static assets,
- **handles `/api/*`** by calling football-data.org with the key from an encrypted **Secret**,
- **caches** responses at the edge (so the free ~10 req/min limit is a non-issue),
- serves everything **same-origin**, so there is **no CORS at all**.

One account, no credit card, $0 for this use case (100k requests/day free; static assets free/unlimited; real Secrets included).

## Data flow
```
Browser app  --(same-origin GET /api/...)-->  Cloudflare Worker  --(adds X-Auth-Token from Secret)-->  football-data.org
     ^                                              |  (checks edge cache first; caches result)
     +------------------ clean JSON ----------------+
```
The browser never sees the key, never calls football-data.org, never touches CORS.

## Build/deploy (minimum steps)
1. Get the free token at football-data.org/client/register (done).
2. Create one free Cloudflare account (no card).
3. Scaffold (in this repo): `public/index.html` (the app, calling `/api/...`), `src/index.js` (the Worker: serve assets + proxy `/api/*` + cache), `wrangler.toml`.
4. Store the key as a Secret named `FOOTBALL_DATA_KEY` — Worker → Settings → Variables & Secrets → Add → Secret (or `npx wrangler secret put FOOTBALL_DATA_KEY`). Never in source.
5. Deploy: `npx wrangler deploy` (or the dashboard). Get a `*.workers.dev` URL.
6. Share the URL. Works on any device, no install.

## Why this is the reusable pattern
**Every app that touches a keyed external API gets one backend project that hosts the app, holds the secret, and proxies the call — no keys in the browser, no exceptions.** Stocks, weather, sports, an LLM, payments — same shape; change the URL and the cache rule. It's the same idea as the Firebase model (Cloud Functions + Secret Manager + Hosting), collapsed into one Cloudflare Worker. It retires the static-single-file anti-pattern that dead-ends the moment real data, keys, or rate limits appear.

## Honest tradeoffs
- **2 accounts** (Cloudflare + football-data.org) — the floor.
- **$0**; caching keeps you under the free limits.
- **Friction:** a small `wrangler.toml` + one deploy command (the AI tool writes/runs it); and caching durations are a deliberate choice (live ~15–30s, fixtures/standings ~60s).
- **No CORS, ever** — same-origin by construction.
