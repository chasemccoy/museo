const fetch = require('node-fetch')

const API_ENDPOINT = (query, numResults = 300) =>
  `https://search.artsmia.org/${query}%20rights_type:"Public%20Domain"%20image:valid?size=${numResults}`

const IMAGE_URL = (id) => `https://${id % 7}.api.artsmia.org/800/${id}.jpg`

const ITEM_URL = (id) => `https://collections.artsmia.org/art/${id}`

function shapeMiaData(json) {
  return json.hits.hits
    .filter((item) => item._score > 0.5) // only include results above a "score" threshold
    .map((item) => ({
      title: item._source.title,
      image: IMAGE_URL(item._id),
      url: ITEM_URL(item._id),
    }))
}

exports.artsmia = async (query) => {
  try {
    const response = await fetch(API_ENDPOINT(query))
    const json = await response.json()
    const morePages = json.hits.total > json.hits.hits.length

    let data = shapeMiaData(json)

    if (morePages) {
      const response2 = await fetch(
        API_ENDPOINT(query, Math.min(700, json.hits.total))
      )
      const json2 = await response2.json()

      // the API doesn't paginate - so this search (with 700) includes the 300
      // from the first request.
      data = shapeMiaData(json2)
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

    const data = await this.artsmia(query)

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
