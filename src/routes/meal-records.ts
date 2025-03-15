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

  // 查詢時間範圍內的餐食記錄
  fastify.get<{
    Querystring: {
      start_date?: string;  // ISO 8601 UTC 時間戳
      end_date?: string;    // ISO 8601 UTC 時間戳
    };
    Reply: {
      records: Array<{
        id: string;
        foodName: string;
        imageUrl: string | null;
        mealType: MealType;
        notes: string | null;
        calories: number;
        protein: number | null;
        carbs: number | null;
        fat: number | null;
        fiber: number | null;
        sugar: number | null;
        sodium: number | null;
        eaten_at: string;
      }>;
      msg?: string;
    }
  }>('/api/meal-records', {
    onRequest: [async (request, reply) => {
      await fastify.authenticate(request, reply)
    }],
    schema: {
      description: '查詢時間範圍內的餐食記錄',
      tags: ['餐食記錄'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          start_date: { 
            type: 'string',
            format: 'date-time',
            description: 'ISO 8601 UTC 時間戳，若未提供則查詢所有記錄'
          },
          end_date: { 
            type: 'string',
            format: 'date-time',
            description: 'ISO 8601 UTC 時間戳，若未提供則使用當前時間'
          }
        }
      },
      response: {
        200: {
          description: '查詢成功',
          type: 'object',
          properties: {
            records: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  foodName: { type: 'string' },
                  imageUrl: { type: ['string', 'null'] },
                  mealType: { 
                    type: 'string',
                    enum: ['breakfast', 'lunch', 'dinner', 'snack']
                  },
                  notes: { type: ['string', 'null'] },
                  calories: { type: 'number' },
                  protein: { type: ['number', 'null'] },
                  carbs: { type: ['number', 'null'] },
                  fat: { type: ['number', 'null'] },
                  fiber: { type: ['number', 'null'] },
                  sugar: { type: ['number', 'null'] },
                  sodium: { type: ['number', 'null'] },
                  eaten_at: { type: 'string', format: 'date-time' }
                }
              }
            },
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
    handler: async (request, reply) => {
      try {
        const userId = request.user?.userId
        if (!userId) {
          return reply.code(401).send({
            records: [],
            msg: '無法取得使用者身份，請重新登入'
          })
        }

        const { start_date, end_date } = request.query
        const endDate = end_date ? new Date(end_date) : new Date()
        const startDate = start_date ? new Date(start_date) : new Date(0) // 如果沒有提供開始日期，則從 1970 年開始查詢

        const records = await prisma.mealRecord.findMany({
          where: {
            userId,
            eaten_at: {
              gte: startDate,
              lte: endDate
            }
          },
          orderBy: {
            eaten_at: 'desc'  // 由新到舊排序
          },
          select: {
            id: true,
            foodName: true,
            imageUrl: true,
            mealType: true,
            notes: true,
            calories: true,
            protein: true,
            carbs: true,
            fat: true,
            fiber: true,
            sugar: true,
            sodium: true,
            eaten_at: true
          }
        })

        // 將日期轉換為 ISO 字串格式
        const formattedRecords = records.map(record => ({
          ...record,
          eaten_at: record.eaten_at.toISOString()
        }))

        return reply.send({
          records: formattedRecords,
          msg: '查詢成功'
        })
      } catch (error: unknown) {
        request.log.error(error)
        return reply.code(500).send({
          records: [],
          msg: `查詢餐食記錄失敗: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }
  })
}

export default routes 