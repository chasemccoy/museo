const { CACHE_HEADERS } = require('./lib/cache')

const API_ENDPOINT = (query) =>
  `https://api.smk.dk/api/v1/art/search?keys=${query}&filters=%5Bpublic_domain%3Atrue%5D,%5Bhas_image%3Atrue%5D&rows=100`

const ITEM_URL = (objectNumber) =>
  `https://open.smk.dk/en/artwork/image/${objectNumber}`

exports.smk = async (query) => {
  try {
    const response = await fetch(API_ENDPOINT(query))
    const json = await response.json()

    if (!json.items) {
      return []
    }

    return json.items
      .filter((item) => item.image_thumbnail && item.titles && item.titles[0])
      .map((item) => ({
        title: item.titles[0].title,
        image: item.image_thumbnail,
        url: ITEM_URL(item.object_number),
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

    const data = await this.smk(query)

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
