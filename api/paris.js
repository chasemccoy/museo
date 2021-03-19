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
      }
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
      body: {
        query: JSON.stringify(graphqlQuery(query))
      }
    })

    // const json = await response.json()

    console.log(response)


    // let data = publicImages.map((item) => ({
    //   title: item.title,
    //   image: item.webImage.url,
    //   url: item.links.web,
    // }))

    return {
      statusCode: 200,
      body: JSON.stringify({}),
    }
  } catch (error) {
    return {
      statusCode: 422,
      body: String(error),
    }
  }
}
