const fetch = require('node-fetch')
const { CACHE_HEADERS } = require('./lib/cache')

// reusability=open limits results to public-domain and CC-licensed works
const API_ENDPOINT = (query) =>
  `https://api.europeana.eu/record/v2/search.json?wskey=${
    process.env.EUROPEANA_TOKEN
  }&query=${encodeURIComponent(
    query
  )}&qf=TYPE:IMAGE&reusability=open&media=true&thumbnail=true&rows=100`

exports.europeana = async (query) => {
  if (!process.env.EUROPEANA_TOKEN) {
    return []
  }

  try {
    const response = await fetch(API_ENDPOINT(query))
    const json = await response.json()

    if (!json.success || !json.items) {
      return []
    }

    return json.items
      .filter(
        (item) =>
          item.title && item.title[0] && item.edmPreview && item.edmPreview[0]
      )
      .map((item) => ({
        title: item.title[0],
        image: item.edmPreview[0],
        url: item.guid,
      }))
  } catch (error) {
    return []
  }
}

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q

  if (!process.env.EUROPEANA_TOKEN) {
    return {
      statusCode: 200,
      headers: CACHE_HEADERS,
      body: JSON.stringify([]),
    }
  }

  try {
    if (!query) {
      throw 'Specify a query parameter'
    }

    const data = await this.europeana(query)

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
