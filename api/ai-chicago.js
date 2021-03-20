const fetch = require('node-fetch')

const API_ENDPOINT = (query, page = 1) => `https://api.artic.edu/api/v1/artworks/search?q=${query}&query[term][is_public_domain]=true&limit=100&page=${page}&fields=title,image_id,id,description`

const IMAGE_URL = (id) => `https://artic.edu/iiif/2/${id}/full/843,/0/default.jpg`

const ITEM_URL = (id) => `https://www.artic.edu/artworks/${id}`

exports.aiChicago = async (query) => {
  const response = await fetch(API_ENDPOINT(query))
  const json = await response.json()
  const morePages = json.pagination.total_pages > 1

  let data = json.data.map(item => ({
    title: item.title,
    image: IMAGE_URL(item.image_id),
    url: ITEM_URL(item.id)
  }))

  if (morePages) {
    const response2 = await fetch(API_ENDPOINT(query, 2))
    const json2 = await response2.json()

    data = data.concat(json2.data.map(item => ({
      title: item.title,
      image: IMAGE_URL(item.image_id),
      url: ITEM_URL(item.id)
    })))
  }

  return data
}

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q

  try {
    if (!query) {
      throw 'Specify a query parameter'
    }
    
    const data = await this.aiChicago(query)

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
