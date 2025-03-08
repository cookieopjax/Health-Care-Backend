// 路由索引文件
import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import foodAnalysisRoutes from './food-analysis.js'
import { registerRoutes as registerAuthRoutes } from './auth.js'
import { userRoutes } from './users.js'

/**
 * 註冊所有路由
 * @param {FastifyInstance} fastify - Fastify實例
 */
const routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // 根路由 - 服務狀態檢查
  fastify.get('/', {
    schema: {
      description: '檢查服務狀態',
      tags: ['系統'],
      response: {
        200: {
          description: '成功響應',
          type: 'object',
          properties: {
            status: { type: 'string', description: '服務狀態' },
            message: { type: 'string', description: '狀態描述' },
            timestamp: { type: 'string', format: 'date-time', description: '時間戳' },
            version: { type: 'string', description: '服務版本' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      return { 
        status: 'ok',
        message: '服務正常運行中',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }
  })

  // 註冊食物分析路由
  await fastify.register(foodAnalysisRoutes)

  // 註冊認證路由
  await fastify.register(registerAuthRoutes, { prefix: '/auth' })

  // 註冊使用者路由
  await fastify.register(userRoutes, { prefix: '/users' })

  // 在這裡可以添加更多路由或引入其他路由模塊
  // 例如: await fastify.register(userRoutes, { prefix: '/api/users' });
}

export default routes 