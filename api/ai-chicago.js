const { CACHE_HEADERS } = require('./lib/cache')

// Note: is_public_domain is filtered client-side rather than with a
// query[term] param — the term filter inflates every result's _score,
// which would make non-matching filler indistinguishable from weak matches.
const API_ENDPOINT = (query, page = 1) =>
  `https://api.artic.edu/api/v1/artworks/search?q=${query}&limit=100&page=${page}&fields=title,image_id,id,is_public_domain`

const IMAGE_URL = (id) =>
  `https://artic.edu/iiif/2/${id}/full/843,/0/default.jpg`

const ITEM_URL = (id) => `https://www.artic.edu/artworks/${id}`

// The AIC API scores the entire collection against the query rather than
// filtering to matches — non-matching artworks come back with near-zero
// scores in a default popularity order. Only keep genuine matches.
const shapeAicData = (json) =>
  json.data
    .filter(
      (item) => item._score > 0.5 && item.is_public_domain && item.image_id
    )
    .map((item) => ({
      title: item.title,
      image: IMAGE_URL(item.image_id),
      url: ITEM_URL(item.id),
    }))

exports.aiChicago = async (query) => {
  try {
    const response = await fetch(API_ENDPOINT(query))
    const json = await response.json()

    let data = shapeAicData(json)

    // Only fetch page 2 if page 1 ended on a genuine match, meaning there
    // are likely more beyond it
    const lastItem = json.data[json.data.length - 1]
    if (lastItem && lastItem._score > 0.5 && json.pagination.total_pages > 1) {
      const response2 = await fetch(API_ENDPOINT(query, 2))
      const json2 = await response2.json()

      data = data.concat(shapeAicData(json2))
    }

    return data
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

    const data = await this.aiChicago(query)

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
