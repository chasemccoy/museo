const { CACHE_HEADERS } = require('./lib/cache')

// The Rijksmuseum retired their classic collection API (it returns 410) in
// favor of Linked Art data services. The new search returns only object IDs;
// title/rights live on the object record and the image URL sits two hops
// away (object → VisualItem → DigitalObject). No API key required.
const SEARCH_ENDPOINT = (field, query) =>
  `https://data.rijksmuseum.nl/search/collection?${field}=${encodeURIComponent(
    query
  )}&imageAvailable=true`

// Every object costs three sub-requests, so keep the pool small
const MAX_OBJECTS = 24

const resolve = async (url) => {
  const response = await fetch(url, {
    headers: { Accept: 'application/ld+json' },
  })
  return response.json()
}

// VisualItem IDs mirror object IDs with the third digit flipped 0 → 2
// (object 200107233 → visual item 202107233), which saves one hop
const visualItemUrl = (objectUrl) =>
  objectUrl.replace('id.rijksmuseum.nl/200', 'id.rijksmuseum.nl/202')

const getTitle = (object) => {
  const name = (object.identified_by || []).find((x) => x.type === 'Name')
  return name && name.content
}

const isPublicDomain = (object) =>
  JSON.stringify(object.subject_of || '').includes(
    'creativecommons.org/publicdomain'
  )

const getWebPage = (object) => {
  for (const subject of object.subject_of || []) {
    for (const carrier of subject.digitally_carried_by || []) {
      if (
        carrier.format === 'text/html' &&
        carrier.access_point &&
        carrier.access_point[0]
      ) {
        return carrier.access_point[0].id
      }
    }
  }
  return null
}

const getImage = async (objectUrl) => {
  const visual = await resolve(visualItemUrl(objectUrl))
  const digitalId =
    visual.digitally_shown_by && visual.digitally_shown_by[0]
      ? visual.digitally_shown_by[0].id
      : null
  if (!digitalId) {
    return null
  }

  const digital = await resolve(digitalId)
  const imageUrl =
    digital.access_point && digital.access_point[0]
      ? digital.access_point[0].id
      : null

  // Ask the IIIF server for a sized rendition instead of the full original
  return imageUrl ? imageUrl.replace('/full/max/', '/full/800,/') : null
}

exports.rijks = async (query) => {
  try {
    // The new API has no general keyword param — search titles and
    // descriptions separately and union the results
    const searches = await Promise.allSettled(
      ['title', 'description'].map(async (field) => {
        const response = await fetch(SEARCH_ENDPOINT(field, query))
        const json = await response.json()
        return (json.orderedItems || []).map((item) => item.id)
      })
    )

    const ids = [
      ...new Set(
        searches
          .filter((result) => result.status === 'fulfilled')
          .flatMap((result) => result.value)
      ),
    ].slice(0, MAX_OBJECTS)

    const objects = await Promise.allSettled(
      ids.map(async (id) => {
        const [object, image] = await Promise.all([resolve(id), getImage(id)])

        if (!image || !isPublicDomain(object)) {
          return null
        }

        return {
          title: getTitle(object),
          image,
          url: getWebPage(object) || id,
        }
      })
    )

    return objects
      .filter((result) => result.status === 'fulfilled' && result.value)
      .map((result) => result.value)
  } catch (error) {
    return []
  }
}

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q

  try {
    if (!query) {
      throw 'Specify a query parameter'
    }

    const data = await this.rijks(query)

    return {
      statusCode: 200,
      headers: CACHE_HEADERS,
      body: JSON.stringify(data),
    }
  } catch (error) {
    return {
      statusCode: 422,
      body: String(error),
    }
  }
}
