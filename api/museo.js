const {aiChicago} = require('./ai-chicago') 
const {artsmia} = require('./artsmia') 
const {harvard} = require('./harvard') 
const {nypl} = require('./nypl') 
const {rijks} = require('./rijks') 
const {cleveland} = require('./cleveland') 

const interleave = ([x, ...xs], ys) => (x ? [x, ...interleave(ys, xs)] : ys)

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q
  const sources = [aiChicago, artsmia, harvard, nypl, rijks, cleveland]

  try {
    if (!query) {
      throw 'Specify a query parameter'
    }

    const results = await Promise.all(
      sources.map(async (source) => {
        return source(query)
      })
    )

    const data = results.reduce((acc, result) => {
      return interleave(acc, result)
    }, [])
    
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