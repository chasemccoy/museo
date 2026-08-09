const fetch = require('node-fetch')
const { CACHE_HEADERS } = require('./lib/cache')

const API_ENDPOINT = `http://apicollections.parismusees.paris.fr/graphql`

// field_image_libre marks works whose images are freely reusable (CC0)
const graphqlQuery = (query) => `
  {
    nodeQuery(
      filter: {
        conditions: [
          {field: "title", value: "%${query.replace(/[\\"%]/g, '')}%", operator: LIKE},
          {field: "type", value: "oeuvre"},
          {field: "field_visuels", operator: IS_NOT_NULL},
          {field: "field_visuels.entity.field_image_libre", value: "1"}
        ]
      },
      limit: 100
    ) {
      entities {
        ... on NodeOeuvre {
          title
          url: absolutePath
          fieldVisuels {
            entity {
              url: publicUrl
            }
          }
        }
      }
    }
  }
`

exports.paris = async (query) => {
  if (!process.env.PARIS_TOKEN) {
    return []
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': process.env.PARIS_TOKEN,
      },
      body: JSON.stringify({ query: graphqlQuery(query) }),
    })

    const json = await response.json()

    if (!json.data || !json.data.nodeQuery || !json.data.nodeQuery.entities) {
      return []
    }

    return json.data.nodeQuery.entities
      .filter(
        (item) =>
          item &&
          item.title &&
          item.fieldVisuels &&
          item.fieldVisuels[0] &&
          item.fieldVisuels[0].entity
      )
      .map((item) => ({
        title: item.title,
        image: item.fieldVisuels[0].entity.url,
        url: item.url,
      }))
  } catch (error) {
    return []
  }
}

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q

  if (!process.env.PARIS_TOKEN) {
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

    const data = await this.paris(query)

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
