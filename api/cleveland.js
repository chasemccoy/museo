const fetch = require('node-fetch')

const API_ENDPOINT = (query) =>
  `https://openaccess-api.clevelandart.org/api/artworks/?q=${query}&has_image=1&limit=100&cc0`

exports.cleveland = async (query) => {
  try {
    const response = await fetch(API_ENDPOINT(query))
    if (!response.ok) {
      throw 'Query to Cleveland API failed'
    }

    const json = await response.json()

    return json.data.map((item) => ({
      title: item.title,
      image: item.images.web.url,
      url: item.url,
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

    const data = await this.cleveland(query)

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
