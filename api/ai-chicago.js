const fetch = require('node-fetch')

const API_ENDPOINT = query => `https://api.artic.edu/api/v1/artworks/search?q=${query}&query[term][is_public_domain]=true&limit=100&fields=title,image_id,description`

const IMAGE_URL = (id) => `https://www.artic.edu/iiif/2/${id}/full/843,/0/default.jpg`

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q

  try {
    if (!query) {
      throw 'Specify a query parameter'
    }
    
    const response = await fetch(API_ENDPOINT(query))
    const json = await response.json()

    const data = json.data.map(item => ({
      title: item.title,
      image: IMAGE_URL(item.image_id)
    }))

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  } catch (error) {
    return {
      statusCode: 422,
      body: String(error)
    }
  }
}
