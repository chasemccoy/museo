import { aiChicago } from './ai-chicago.js'
import { artsmia } from './artsmia.js'
import { harvard } from './harvard.js'
import { rijks } from './rijks.js'
import { cleveland } from './cleveland.js'
import { met } from './met.js'
import { smk } from './smk.js'
import { wellcome } from './wellcome.js'
import { smithsonian } from './smithsonian.js'
import { paris } from './paris.js'
import { europeana } from './europeana.js'
import { CACHE_HEADERS } from './lib/cache.js'

// One function invocation per search instead of one per source. Results
// stream back as newline-delimited JSON, one line per source as it resolves,
// so the client still renders progressively.
const SOURCES = {
  'ai-chicago': aiChicago,
  artsmia,
  harvard,
  rijks,
  cleveland,
  met,
  smk,
  wellcome,
  smithsonian,
  paris,
  europeana,
}

// Beyond this per source the grid is all cost and no discovery value
const MAX_PER_SOURCE = 48

export default async (request) => {
  const query = new URL(request.url).searchParams.get('q')

  if (!query) {
    return new Response('Specify a query parameter', { status: 422 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      await Promise.all(
        Object.entries(SOURCES).map(async ([source, search]) => {
          let items = []
          try {
            items = await search(query)
          } catch (error) {
            items = []
          }
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ source, items: items.slice(0, MAX_PER_SOURCE) }) +
                '\n'
            )
          )
        })
      )
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson', ...CACHE_HEADERS },
  })
}
