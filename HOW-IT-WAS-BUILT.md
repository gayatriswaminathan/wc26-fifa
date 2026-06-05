# How this was built — a PM directing an AI agent team

This app wasn't typed out by one person in an editor. It was **run like a program**: a human PM holding the spec and the quality bar, directing a team of specialized AI agents (a system analyst, an AI engineer, designers, and builders) that did the execution. Here's the actual sequence — including the things that broke, which are the interesting part.

## 1. Spec before code
The **system-analyst** agent turned "a World Cup app a die-hard fan would love" into a real plan — features, data model, what "done" means. The build only moved fast *because* the spec was sharp. (See `ARCHITECTURE.md`.)

## 2. First version shipped on sample data
A single-file web app: matches, standings, favourites, match detail. Looked done. It wasn't — it had no live data and no reason to come back.

## 3. The data wall
Wiring it to a real football API failed instantly: `Failed to fetch`. The **ai-engineer** agent diagnosed it: football-data.org requires a key *and* blocks direct browser calls (CORS). Conclusion: a static web page **cannot** safely use a keyed API — the key can't sit in the browser, and the browser gets blocked.

## 4. The architecture pivot (the important one)
Instead of hacking around it, the **system-analyst + cto-advisor + ai-engineer** specced the real fix: **one Cloudflare Worker** that hosts the app, holds the API key as an encrypted secret, proxies the API, and caches responses — so the browser only ever talks to *its own* backend. No CORS, no exposed key. One account, no card, deployed in under a minute. This is the same "hold the key in a backend function" pattern used in production everywhere; it's now the reusable template for any app that needs live data.

## 5. Design, iterated against a reference
The first looks were "plain." Rather than argue with pixels, the design was rebuilt against concrete references the PM chose — dark was tried and rejected, then a **light, polished aesthetic** was nailed. The **premium-product-designer + ui-builder** agents executed each pass; the PM made the taste calls.

## 6. Retention, because a fan app dies without it
The PM pushed past "it works" to "why would anyone come back?" The **ui-builder + logic-architect** agents then built the loop: daily pick'em + streak + stats, matchday alerts, a bracket / road-to-the-final, badges, and shareable match cards.

## What this demonstrates
- **The code was the short part.** The leverage was in scoping, sequencing, holding the bar, and routing the *corrected* problem back to the right specialist when something broke.
- **Judgment stayed human.** The agents are excellent labor and weak on taste — they pattern-match "fan app → confetti." Knowing the app needed a retention loop, rejecting the flat design, choosing the architecture: that was the PM's job.
- **It actually shipped** — a live, shareable URL, built the right way.

*The agent team itself (system-analyst, cto-advisor, ai-engineer, designers, builders, plus a sprint pipeline) is a reusable set — see the `tpm-agent-team` repo.*
