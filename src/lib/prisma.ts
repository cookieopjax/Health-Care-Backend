import { PrismaClient } from '@prisma/client'

// 避免在開發環境中重複建立連接
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
} 