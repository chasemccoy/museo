const fetch = require('node-fetch')
const { CACHE_HEADERS } = require('./lib/cache')

const API_ENDPOINT = (query) =>
  `https://api.si.edu/openaccess/api/v1.0/search?q=${query}%20AND%20online_media_type:%22Images%22%20AND%20media_usage:%22CC0%22&api_key=${process.env.SMITHSONIAN_TOKEN}&rows=100`

const IMAGE_URL = (mediaUrl) => `${mediaUrl}&max_w=800`

exports.smithsonian = async (query) => {
  if (!process.env.SMITHSONIAN_TOKEN) {
    return []
  }

  try {
    const response = await fetch(API_ENDPOINT(query))
    const json = await response.json()

    if (!json.response || !json.response.rows) {
      return []
    }

    return json.response.rows
      .filter((item) => {
        const media =
          item.content &&
          item.content.descriptiveNonRepeating &&
          item.content.descriptiveNonRepeating.online_media &&
          item.content.descriptiveNonRepeating.online_media.media
        return media && media[0] && media[0].content
      })
      .map((item) => {
        const record = item.content.descriptiveNonRepeating
        return {
          title: item.title,
          image: IMAGE_URL(record.online_media.media[0].content),
          url: record.record_link || record.guid,
        }
      })
  } catch (error) {
    return []
  }
}

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q

  if (!process.env.SMITHSONIAN_TOKEN) {
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

    const data = await this.smithsonian(query)

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
