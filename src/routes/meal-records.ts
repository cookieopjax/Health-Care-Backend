// 餐食記錄路由
import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { MealType } from '@prisma/client'

// 定義請求體介面
interface CreateMealRecordBody {
  analysis: {
    name: string;
    nutrition: Array<{
      id: number;
      name: string;
      unit: string;
      value: number;
    }>;
  };
  image_url: string;
  meal_type: MealType;
  notes?: string;
  eaten_at?: string;  // ISO 8601 UTC 時間戳，如果沒提供就用當前時間
}

// 定義路由插件
const routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // 建立餐食記錄
  fastify.post<{
    Body: CreateMealRecordBody;
    Reply: {
      id: string;
      msg?: string;
    }
  }>('/api/meal-records/create', {
    onRequest: [async (request, reply) => {
      await fastify.authenticate(request, reply)
    }],
    schema: {
      description: '建立餐食記錄',
      tags: ['餐食記錄'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['analysis', 'image_url', 'meal_type'],
        properties: {
          analysis: {
            type: 'object',
            required: ['name', 'nutrition'],
            properties: {
              name: { type: 'string' },
              nutrition: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id', 'name', 'unit', 'value'],
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    unit: { type: 'string' },
                    value: { type: 'number' }
                  }
                }
              }
            }
          },
          image_url: { type: 'string' },
          meal_type: { 
            type: 'string',
            enum: ['breakfast', 'lunch', 'dinner', 'snack']
          },
          notes: { type: 'string' },
          eaten_at: { 
            type: 'string',
            format: 'date-time',
            description: 'ISO 8601 UTC 時間戳'
          }
        }
      },
      response: {
        200: {
          description: '建立成功',
          type: 'object',
          properties: {
            id: { type: 'string' },
            msg: { type: 'string' }
          }
        },
        400: {
          description: '請求錯誤',
          type: 'object',
          properties: {
            msg: { type: 'string' }
          }
        },
        401: {
          description: '未授權的存取',
          type: 'object',
          properties: {
            msg: { type: 'string' }
          }
        },
        500: {
          description: '服務器錯誤',
          type: 'object',
          properties: {
            msg: { type: 'string' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{ Body: CreateMealRecordBody }>, reply: FastifyReply) => {
      try {
        const { analysis, image_url, meal_type, notes, eaten_at } = request.body
        
        console.log('完整的 request.user:', request.user)
        console.log('request.headers:', request.headers)
        const userId = request.user?.userId

        if (!userId) {
          return reply.code(401).send({
            msg: '無法取得使用者身份，請重新登入'
          })
        }

        console.log('userId:', userId)
        
        // 從營養資訊陣列中找出各項營養素的值
        const findNutritionValue = (name: string): number | null => {
          const item = analysis.nutrition.find(n => n.name.toLowerCase() === name.toLowerCase())
          return item ? item.value : null
        }

        // 處理時間
        const eatenAtDate = eaten_at ? new Date(eaten_at) : new Date()

        // 建立記錄
        const mealRecord = await prisma.mealRecord.create({
          data: {
            userId,
            foodName: analysis.name,
            description: null,
            imageUrl: image_url,
            mealType: meal_type,
            notes,
            calories: findNutritionValue('calories') || 0,
            protein: findNutritionValue('protein'),
            carbs: findNutritionValue('carbohydrates'),
            fat: findNutritionValue('fat'),
            fiber: findNutritionValue('fiber'),
            sugar: findNutritionValue('sugar'),
            sodium: findNutritionValue('sodium'),
            eaten_at: eatenAtDate,
            eaten_date: eatenAtDate,  // PostgreSQL 會自動轉換為日期
            createdTime: new Date()
          }
        })

        return reply.send({
          id: mealRecord.id,
          msg: '餐食記錄建立成功'
        })
      } catch (error: unknown) {
        request.log.error(error)
        return reply.code(500).send({
          msg: `建立餐食記錄失敗: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }
  })
}

export default routes 