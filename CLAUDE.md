# Museo

Visual search engine for public-domain images across eleven museums and libraries. Live at https://museo.app, deployed to Netlify from `main` on every push (Next.js 16 pages router + Netlify Functions).

## Architecture

- `src/pages/index.js` — the whole UI. A search makes **one** request to `/api/search` and reads an NDJSON stream, one line per source as that museum responds, interleaving results round-robin as they arrive. Do not reintroduce per-source fetches from the client: that was 11 function invocations per search and blew through Netlify's free Functions allowance (125k/month) in Sept 2026.
- `api/search.mjs` — the streaming aggregator (Functions 2.0 `export default`, `.mjs`). Runs every source in parallel, caps each at 48 items, streams `{source, items}` lines.
- `api/<source>.js` — one module per museum, each exporting `{ <name>(query) }` plus a legacy v1 `handler` so it's also reachable at `/api/<source>?q=`. Modules swallow upstream errors and return `[]`.
- `api/museo.js` — older non-streaming aggregator at `/api/museo`; kept for API consumers, unused by the UI.
- `api/lib/cache.js` — shared cache headers. Non-empty responses are CDN-cached (6h, 7d stale-while-revalidate). Handlers send no cache headers on empty results so a transient upstream failure can't be pinned.
- `/api/*` is redirected to `/.netlify/functions/:splat` in `netlify.toml`.
- Results are plain `<img loading="lazy">`, not `next/image` — images come from 13+ museum hosts.

## Development

```
yarn install
yarn dev      # npx netlify-cli dev → http://localhost:8888
```

- `netlify-cli` is intentionally not a dependency (it added ~400 MB to every Netlify build); `yarn dev` runs it via npx.
- The repo is linked to the Netlify site, so `netlify dev` injects the production env vars (`HARVARD_TOKEN`, `SMITHSONIAN_TOKEN`, `PARIS_TOKEN`, `EUROPEANA_TOKEN`). Sources without a token return `[]` silently.
- Never run `yarn build` while `netlify dev` is running — it clobbers `.next` and the dev server serves blank pages until restarted with a cleared `.next`.
- Node version is pinned by `.nvmrc`. Setting `NODE_VERSION` in `netlify.toml` does **not** work on Netlify's current build image.
- Browser verification: the Claude desktop preview pane often reports `document.visibilityState === "hidden"`, and Next defers hydration in hidden documents, so React never attaches and searches look broken. Verify in a real visible browser (the Chrome DevTools MCP works well) before concluding anything is wrong.

## Browser support

`package.json` has a `browserslist` widened to Safari/iOS 14 and Chrome/Firefox/Edge 90. Next 16 defaults to Safari 16.4+ and ships class static blocks and `#private` fields untranspiled in its own runtime chunk, which is a syntax error in older Safari — the page never hydrates and every search returns nothing. `src/polyfills.js` (imported first in `_app.js`) covers the remaining runtime gaps (`Object.hasOwn`, `Array.prototype.at`, `structuredClone`). After any Next upgrade, confirm with:

```
grep -o 'static{' .next/static/chunks/*.js | wc -l   # must be 0
```

## Upstream API quirks (hard-won)

- **Art Institute of Chicago** scores the *entire* collection against every query rather than filtering, so non-matches come back with near-zero `_score` in popularity order. `ai-chicago.js` filters on `_score > 0.5` and checks `is_public_domain` client-side — the `query[term]` URL filter must stay out, because it inflates every score by ~5.5 and hides the gap. Image URLs use `www.artic.edu` (bare `artic.edu` 301s).
- **The Met** retired `v1/search` on 2026-10-01; use `v1.1/search?limit=&offset=`. Search returns IDs only, so each object is a follow-up request (capped at 60).
- **Rijksmuseum** retired its classic API (410). The Linked Art replacement returns IDs; title/rights are on the object record and the image is two hops away (object → VisualItem → DigitalObject → micr.io IIIF URL). VisualItem IDs are derivable from object IDs (`200…` → `202…`). No key needed.
- **NYPL** shut down its API on 2026-08-01 with no replacement — removed. Don't re-add.
- **Paris Musées** is a title-only `LIKE` search in French; English terms underperform. Don't let the query reach the GraphQL string unescaped.
- **Wellcome** returns IIIF `info.json` URLs; rewrite to a sized image.
- **Smithsonian** uses an api.data.gov key; `DEMO_KEY` works for testing but is rate-limited to ~30/hour.

## Diagnosing "Museo returns nothing" reports

In order: (1) check https://www.netlifystatus.com/api/v2/incidents.json — an edge-network blip blanks every search at once and is invisible an hour later; (2) probe each `/api/<source>?q=tree` on production — a dead upstream looks like "no matches" because modules return `[]` on error; (3) ask for the user's browser version. The UI shows an explicit "couldn't reach any of its sources" message only when the `/api/search` request itself fails after retries.

## Adding a source

1. Create `api/<name>.js` following an existing module: `exports.<name> = async (query) => [{ title, image, url }]`, filtering to public-domain items with images, plus the standard `handler`.
2. Import it in `api/search.mjs` (`SOURCES`) and `api/museo.js`; add its key to `SOURCE_ORDER` in `src/pages/index.js`.
3. Add it to `SOURCES` in `src/components/SourceTicker.js`, the count in the subtitle copy, and the README list (and token docs if it needs a key).
4. Verify the API returns images, supports keyword search, and can filter to public domain before wiring it in — several candidates (V&A, Library of Congress) fail the last test.

## Conventions

- Plain JavaScript, no TypeScript; CSS modules; sentence case in markdown headings.
- Commits go straight to `main`; a push is a production deploy. Netlify only publishes successful builds, so a broken push fails closed. Watch a deploy with `npx netlify-cli api listSiteDeploys --data '{"site_id": "<id>", "per_page": 1}'` (site id is in `.netlify/state.json`).
