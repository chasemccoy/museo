// Museum collections change on the scale of weeks — cache search responses
// so repeat queries are served by the CDN instead of invoking a function.
// `Netlify-CDN-Cache-Control` governs Netlify's edge/durable cache;
// `Cache-Control` governs the browser.
exports.CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=3600',
  'Netlify-CDN-Cache-Control':
    'public, durable, s-maxage=21600, stale-while-revalidate=604800',
}
