import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import config from '../config.js'

async function jwtPlugin(fastify: FastifyInstance, options: any) {
  fastify.register(fastifyJwt, {
    secret: config.jwt.secret
  })

  // 加入 `authenticate` 裝飾函式 (middleware)
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await request.jwtVerify<{
        userId: string
        email: string
        [key: string]: any
      }>()
      request.user = user
    } catch (err) {
      reply.status(401).send({
        msg: '未授權的存取'
      })
    }
  })
}

export default fp(jwtPlugin)
