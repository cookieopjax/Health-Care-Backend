import bcrypt from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { JWTPayload, JWTFullPayload } from '../types/auth.js'

const prisma = new PrismaClient()

// 密碼加密
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// 密碼驗證
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

// 產生 JWT 權杖
export const generateToken = async (fastify: FastifyInstance, payload: any): Promise<string> => {
  return fastify.jwt.sign(payload, {
    expiresIn: '7d' // 設定權杖有效期限為 7 天
  })
}

// 驗證 JWT 權杖
export const verifyToken = async (fastify: FastifyInstance, token: string): Promise<JWTFullPayload> => {
  return fastify.jwt.verify<JWTFullPayload>(token)
}

// 取得當前使用者
export const getCurrentUser = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      updatedAt: true
    }
  })
}

// 更新使用者資料
export const updateUser = async (userId: string, data: {
  username?: string
  email?: string
  password?: string
}) => {
  const updateData = { ...data }
  
  // 如果有更新密碼，需要先加密
  if (data.password) {
    updateData.password = await hashPassword(data.password)
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      updatedAt: true
    }
  })
} 