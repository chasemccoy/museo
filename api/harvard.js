const fetch = require('node-fetch')

const API_ENDPOINT = (query, page = 1) =>
  `https://api.harvardartmuseums.org/object?apikey=${process.env.HARVARD_TOKEN}&q=${query}&hasimage=1&size=100`
  

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q

  try {
    if (!query) {
      throw 'Specify a query parameter'
    }

    const response = await fetch(API_ENDPOINT(query))
    const json = await response.json()

    const withImages = json.records.filter((item) => item.images.length > 0)

    let data = withImages.map((item) => ({
      title: item.title,
      image: item.images[item.images.length - 1].baseimageurl,
      url: item.url,
    }))

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
