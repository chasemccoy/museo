const fetch = require('node-fetch')

const API_ENDPOINT = (query, page = 1) =>
  `https://www.rijksmuseum.nl/api/en/collection?key=${process.env.RIJKS_TOKEN}&q=${query}&imgonly=true&ps=100`

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q

  if(!process.env.RIJKS_TOKEN) {
    return {
      statusCode: 200,
      body: JSON.stringify([]),
    }
  }

  try {
    if (!query) {
      throw 'Specify a query parameter'
    }

    const response = await fetch(API_ENDPOINT(query))
    const json = await response.json()

    const publicImages = json.artObjects.filter((item) => !!item.permitDownload)

    let data = publicImages.map((item) => ({
      title: item.title,
      image: item.webImage.url,
      url: item.links.web,
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
