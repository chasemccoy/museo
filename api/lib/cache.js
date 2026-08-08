// Museum collections change on the scale of weeks — cache successful search
// responses so repeat queries are served by the CDN instead of re-fanning
// out to ten upstream APIs. `Netlify-CDN-Cache-Control` governs Netlify's
// edge cache; `Cache-Control` governs the browser.
exports.CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=3600',
  'Netlify-CDN-Cache-Control':
    'public, durable, s-maxage=3600, stale-while-revalidate=86400',
}
