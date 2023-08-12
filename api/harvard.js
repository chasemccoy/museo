const fetch = require('node-fetch')

const API_ENDPOINT = (query, page = 1) =>
  `https://api.harvardartmuseums.org/object?apikey=${process.env.HARVARD_TOKEN}&q=${query}&hasimage=1&size=100`

exports.harvard = async (query) => {
  try {
    const response = await fetch(API_ENDPOINT(query))
    const json = await response.json()

    const withImages = json.records.filter((item) => item.images.length > 0)

    return withImages.map((item) => ({
      title: item.title,
      image: item.images[item.images.length - 1].baseimageurl,
      url: item.url,
    }))
  } catch (error) {
    return []
  }
}

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q

  if (!process.env.HARVARD_TOKEN) {
    return {
      statusCode: 200,
      body: JSON.stringify([]),
    }
  }

  try {
    if (!query) {
      throw 'Specify a query parameter'
    }

    const data = await this.harvard(query)

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  } catch (error) {
    return {
      statusCode: 422,
      body: String(error),
    }
  }
}
