// One Cloudflare Worker = static host + same-origin API proxy + secret + cache.
// Browser calls /api/competitions/WC/matches (same origin → no CORS).
// Worker adds the football-data.org key (from the FOOTBALL_DATA_KEY secret) and caches.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });
      // /api/competitions/WC/matches  ->  https://api.football-data.org/v4/competitions/WC/matches
      const fdPath = url.pathname.slice(4) + url.search; // strip "/api"
      const target = "https://api.football-data.org/v4" + fdPath;

      // Cache: slow-changing data 60s, match detail 20s. Collapses many users → 1 upstream call.
      const ttl = fdPath.includes("/matches") || fdPath.includes("/standings") ? 60 : 20;

      const upstream = await fetch(target, {
        headers: { "X-Auth-Token": env.FOOTBALL_DATA_KEY },
        cf: { cacheTtl: ttl, cacheEverything: true },
      });
      const body = await upstream.text();
      return new Response(body, {
        status: upstream.status,
        headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
      });
    }

    // Everything else: serve the static app from public/
    return env.ASSETS.fetch(request);
  },
};
