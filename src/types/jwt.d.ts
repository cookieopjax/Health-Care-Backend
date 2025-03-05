import { FastifyRequest } from 'fastify'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      userId: string
      email: string
      [key: string]: any
    }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    jwtVerify<T = {
      userId: string
      email: string
      [key: string]: any
    }>(): Promise<T>
  }
} 