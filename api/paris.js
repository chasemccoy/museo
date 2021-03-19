const fetch = require('node-fetch')

const API_ENDPOINT = `http://apicollections.parismusees.paris.fr/graphql`

const graphqlQuery = (query) => `
  {
    nodeQuery(
      filter: {
        conditions: [
          {field: "title", value: "%park%", operator: LIKE},
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

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q
  const responseBody = JSON.stringify({query: graphqlQuery(query)})

  if (!process.env.PARIS_TOKEN) {
    return {
      statusCode: 200,
      body: JSON.stringify([]),
    }
  }

  try {
    if (!query) {
      throw 'Specify a query parameter'
    }

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': process.env.PARIS_TOKEN
      },
      body: responseBody
    })

    const json = await response.json()
    let data = []

    if (json.data && json.data.nodeQuery.entities) {
      data = json.data.nodeQuery.entities.map(item => ({
        title: item.title,
        image: item.fieldVisuels[0].entity.url,
        url: item.url
      }))
    }

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
