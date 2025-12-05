import Fastify from 'fastify'
const fastify = Fastify({
  logger: Bun.env.LOGGER === 'true',
})
await fastify.register(import('@fastify/rate-limit'), {
  max: Number(Bun.env.RATE_LIMIT || 1),
  timeWindow: `${Bun.env.RATE_LIMIT_WINDOW || 3} second`,
})

fastify.setErrorHandler(function (error, request, reply) {
  if (error.validation) {
    let message = error.validation[0].message
    if (message.includes('"^\\S+$"')) {
      message = 'userID cannot be empty'
    }
    if (message.includes('versionid')) {
      message =
        'versionID should be set in the headers. Example: versionID:production'
    }
    if (message.includes('development|production|')) {
      message =
        'versionID should be developement, production or any VF version ID.'
    }
    reply.status(400).send({
      error: 'Bad Request',
      message: message,
    })
  } else if (error.statusCode === 429) {
    reply.status(429).send({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded',
    })
  } else {
    reply.send({
      error: error.message,
    })
  }
})

fastify.route({
  method: 'GET',
  url: '/api/health',
  logLevel: 'debug',
  handler: async (request, reply) => {
    reply.status(200)
  },
})

fastify.route({
  method: 'PATCH',
  url: '/api/variables/:userID',
  logLevel: 'debug',
  schema: {
    params: {
      type: 'object',
      properties: {
        userID: { type: 'string', pattern: '^[a-zA-Z0-9_-]+$' },
      },
      required: ['userID'],
    },
    headers: {
      type: 'object',
      properties: {
        versionID: {
          type: 'string',
          pattern:
            '^(development|production|(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+)$',
        },
      },
      required: ['versionID'],
    },
    body: {
      type: 'object',
      additionalProperties: {
        anyOf: [{ type: 'integer' }, { type: 'boolean' }, { type: 'string' }],
      },
    },
  },
  preHandler: async (request, reply) => {
    if (!Bun.env.VOICEFLOW_API_KEY) {
      reply.status(500).send({
        error: 'Internal Server Error',
        message: 'VOICEFLOW_API_KEY is not set  ',
      })
    }
  },
  handler: async (request, reply) => {
    const userID = request.params.userID
    const variables = request.body
    const versionID = request.headers['versionid']
    // Encode userID to prevent path manipulation
    const safeUserID = encodeURIComponent(userID)
    const response = await fetch(
      `${Bun.env.VOICEFLOW_ENDPOINT}/state/user/${safeUserID}/variables`,
      {
        method: 'PATCH',
        body: JSON.stringify(variables),
        headers: {
          Authorization: Bun.env.VOICEFLOW_API_KEY,
          'Content-Type': 'application/json',
          versionID: versionID,
        },
      }
    )
    try {
      const result = await response.json()
      if (Bun.env.RETURN_RESPONSE === 'true') {
        reply.send(result)
      } else {
        reply.status(200)
      }
    } catch (error) {
      reply.status(400).send(error)
    }
  },
})

try {
  await fastify.listen({ port: Number(Bun.env.PORT) || 3001, host: '0.0.0.0' })
  console.log('Server listening on localhost:', fastify.server.address().port)
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
