const { CACHE_HEADERS } = require('./lib/cache')

const SEARCH_ENDPOINT = (query) =>
  `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}&hasImages=true`

const OBJECT_ENDPOINT = (id) =>
  `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`

// The search endpoint only returns object IDs, and each object requires its
// own request — cap how many we fetch to keep response times reasonable.
const MAX_OBJECTS = 60

exports.met = async (query) => {
  try {
    const response = await fetch(SEARCH_ENDPOINT(query))
    const json = await response.json()

    if (!json.objectIDs) {
      return []
    }

    const objects = await Promise.allSettled(
      json.objectIDs.slice(0, MAX_OBJECTS).map(async (id) => {
        const res = await fetch(OBJECT_ENDPOINT(id))
        return res.json()
      })
    )

    return objects
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value)
      .filter((item) => item.isPublicDomain && item.primaryImageSmall)
      .map((item) => ({
        title: item.title,
        image: item.primaryImageSmall,
        url: item.objectURL,
      }))
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

    const data = await this.met(query)

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
