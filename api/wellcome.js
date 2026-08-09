const { CACHE_HEADERS } = require('./lib/cache')

const API_ENDPOINT = (query) =>
  `https://api.wellcomecollection.org/catalogue/v2/images?query=${query}&locations.license=cc0,pdm&pageSize=100`

// The API returns a IIIF info.json URL — turn it into a sized image URL
const IMAGE_URL = (infoUrl) =>
  infoUrl.replace('/info.json', '/full/!760,760/0/default.jpg')

const ITEM_URL = (id) => `https://wellcomecollection.org/works/${id}`

exports.wellcome = async (query) => {
  try {
    const response = await fetch(API_ENDPOINT(query))
    const json = await response.json()

    if (!json.results) {
      return []
    }

    return json.results
      .filter((item) => item.thumbnail && item.source)
      .map((item) => ({
        title: item.source.title,
        image: IMAGE_URL(item.thumbnail.url),
        url: ITEM_URL(item.source.id),
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

    const data = await this.wellcome(query)

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
