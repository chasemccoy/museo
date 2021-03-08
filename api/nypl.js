const fetch = require('node-fetch')

const API_ENDPOINT = (query) =>
  `http://api.repo.nypl.org/api/v1/items/search?q=${query}&publicDomainOnly=true&per_page=100`

const IMAGE_URL = (id) => `http://images.nypl.org/index.php?id=${id}&t=w`

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q

  if(!process.env.NYPL_TOKEN) {
    return {
      statusCode: 200,
      body: JSON.stringify([]),
    }
  }

  try {
    if (!query) {
      throw 'Specify a query parameter'
    }

    const response = await fetch(API_ENDPOINT(query), {
      headers: {
        Authorization: `Token token="${process.env.NYPL_TOKEN}"`,
      },
    })
    const json = await response.json()

    const data = json.nyplAPI.response.result.map((item) => ({
      title: item.title,
      image: IMAGE_URL(item.imageID),
      url: item.itemLink,
    }))

    // data.forEach(item => console.log(item.image))

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
