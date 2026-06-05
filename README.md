# World Cup 2026 — fan app

A fast, light, mobile-first web app for following the FIFA World Cup 2026 — live scores, fixtures, results, group standings, your team, predictions, a knockout bracket, and shareable match cards. Real data, no app store, one URL.

**Live:** https://wc26-fifa.gsspace.workers.dev

---

## Features

- **Live / Fixtures / Results** — real matches from football-data.org, with live-score pulse and a goal flash.
- **Pick your team** — favourite a team and the whole app re-skins to their colours; a hero card counts down to their next kickoff (flips to *Matchday* inside 24h).
- **"Who ya got?" predictions** — pick winners, build a streak, track your record (accuracy, current/best streak, per-day breakdown).
- **Bracket / Road to the Final** — your team's path, advancing as results land.
- **Badges** — unlockables (first pick, 3- and 5-streak, called an upset, perfect group day…).
- **Matchday alerts** — an in-app banner when your team plays today, plus opt-in browser notifications (while the site is open).
- **Goal celebration** — team-colour confetti, haptics, and an optional crowd roar.
- **Shareable match cards** — a clean 1080×1080 card for the group chat.

## Architecture

One Cloudflare Worker does everything — the pattern that lets a "static" web app safely use a keyed, CORS-blocked API:

```
Browser app ── same-origin /api ──▶ Cloudflare Worker ── X-Auth-Token (secret) ──▶ football-data.org
     ▲                                   │  (edge-caches; collapses many users → one upstream call)
     └────────────── clean JSON ─────────┘
```

- The browser calls **its own origin** (`/api/...`) — so there is **no CORS** and **no key in the browser**.
- The Worker holds the football-data.org token as an encrypted **Secret**, proxies the API, and **edge-caches** responses (the free tier is ~10 req/min, shared — caching makes that a non-issue).
- The same Worker serves the static app. One project, one account, $0.

This is the reusable shape for any app that needs live external data: *one backend that holds the key, proxies the API, and hosts the app.*

## Run / deploy

```bash
# 1. Get a free token at https://www.football-data.org/client/register
# 2. From this folder:
npx wrangler login
npx wrangler secret put FOOTBALL_DATA_KEY   # paste your token
npx wrangler deploy                         # prints your live URL
```

Open the URL — it pulls real World Cup 2026 data. No token configured? It falls back to bundled sample data with a banner.

## Tech

Vanilla HTML/CSS/JS (no framework) · Inter + Roboto Mono · Cloudflare Workers (host + proxy + Secrets + cache) · football-data.org API · localStorage for favourites, picks, badges.

## Roadmap

- Cross-user leaderboard (needs a Cloudflare KV store — a `LEADERBOARD_HOOK` is marked in the code).
- Live goals/cards/lineups via an API-Football proxy (richer data tier).

---

*Built by directing a team of AI agents — a system-analyst, designers, and builders — with a human PM in the director's chair.*
