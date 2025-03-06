import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { RegisterSchema, LoginSchema } from '../types/auth.js'
import { hashPassword, verifyPassword, generateToken } from '../utils/auth.js'

const prisma = new PrismaClient()

// 註冊路由
export const registerRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // 註冊
  fastify.post('/register', {
    schema: {
      body: RegisterSchema,
      tags: ['認證']
    }
  }, async (request, reply) => {
    const { username, email, password } = request.body as typeof RegisterSchema

    // 檢查使用者是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return reply.status(400).send({
        error: '使用者已存在'
      })
    }

    // 建立新使用者
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    })

    // 產生 JWT 權杖
    const token = await generateToken(fastify, {
      userId: user.id,
      email: user.email
    })

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    }
  })

  // 登入
  fastify.post('/login', {
    schema: {
      body: LoginSchema,
      tags: ['認證']
    }
  }, async (request, reply) => {
    const { email, password } = request.body as typeof LoginSchema

    // 查找使用者
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return reply.status(401).send({
        error: '帳號或密碼錯誤'
      })
    }

    // 驗證密碼
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return reply.status(401).send({
        error: '帳號或密碼錯誤'
      })
    }

    // 產生 JWT 權杖
    const token = await generateToken(fastify, {
      userId: user.id,
      email: user.email
    })

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    }
  })

  // TODO: refresh token
} 