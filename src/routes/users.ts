import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { UpdateUserSchema } from '../types/auth.js'
import { getCurrentUser, updateUser } from '../utils/auth.js'

const prisma = new PrismaClient()

// 使用者路由
export async function userRoutes(fastify: FastifyInstance) {
  // 取得當前使用者資料
  fastify.get('/me', {
    onRequest: [async (request, reply) => {
      await fastify.authenticate(request, reply)
    }]
  }, async (request, reply) => {
    const user = request.user
    const userData = await getCurrentUser(user.userId)

    if (!userData) {
      return reply.status(404).send({
        msg: '使用者不存在'
      })
    }

    return userData
  })

  // 更新使用者資料
  fastify.put('/me', {
    onRequest: [async (request, reply) => {
      await fastify.authenticate(request, reply)
    }],
    schema: {
      body: UpdateUserSchema
    }
  }, async (request, reply) => {
    const user = request.user
    const updateData = request.body as typeof UpdateUserSchema

    // 檢查 email 是否已被使用
    if (updateData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: updateData.email,
          NOT: {
            id: user.userId
          }
        }
      })

      if (existingUser) {
        return reply.status(400).send({
          msg: '此電子郵件已被使用'
        })
      }
    }

    // 檢查 username 是否已被使用
    if (updateData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: updateData.username,
          NOT: {
            id: user.userId
          }
        }
      })

      if (existingUser) {
        return reply.status(400).send({
          msg: '此使用者名稱已被使用'
        })
      }
    }

    const updatedUser = await updateUser(user.userId, {
      username: updateData.username,
      email: updateData.email,
      password: updateData.password
    })
    return updatedUser
  })
} 