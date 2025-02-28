// 食物分析路由
import fs from 'fs';
import path from 'path';
import util from 'util';
import { pipeline } from 'stream';
import { fileURLToPath } from 'url';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import * as openaiService from '../services/openai-service.js';
import * as s3Service from '../services/s3-service.js';
import config from '../config.js';
import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { MultipartFile } from '@fastify/multipart';

// 獲取當前文件的目錄路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pump = util.promisify(pipeline);

// 定義路由插件
const routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // 註冊multipart插件，用於處理文件上傳
  fastify.register(fastifyMultipart, {
    limits: config.upload.limits
  });

  // 添加 preValidation hook，用於處理 multipart 請求
  fastify.addHook('preValidation', async (request, reply) => {
    if (request.routeOptions.url === '/api/food/analyze' && request.method === 'POST') {
      // 模擬 food_image 屬性的存在，以通過驗證
      request.body = {
        food_image: 'placeholder_for_validation'
      };
    }
  });

  // 註冊static插件，用於提供靜態文件訪問
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../..', config.upload.dir),
    prefix: '/uploads/'
  });

  // 測試API - 不需要上傳圖片
  fastify.get<{
    Reply: {
      success: boolean;
      data?: {
        analysis: string;
        image_url: string;
      };
      error?: string;
    }
  }>('/api/food/analyze/test', {
    schema: {
      description: '測試食物分析API（不需要上傳圖片）',
      tags: ['食物分析'],
      response: {
        200: {
          description: '分析結果',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                analysis: { type: 'string' },
                image_url: { type: 'string' }
              }
            }
          }
        },
        500: {
          description: '服務器錯誤',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        console.log('測試API - 不需要上傳圖片');
        
        // 使用測試路徑
        const testImagePath = 'test_image_path';
        
        // 分析食物圖片（測試模式）
        const result = await openaiService.analyzeFoodImage(testImagePath, true);

        // 返回分析結果
        return {
          success: true,
          data: {
            analysis: result.analysis,
            image_url: '/test_image.jpg'
          }
        };
      } catch (error: any) {
        request.log.error(error);
        return reply.code(500).send({
          success: false,
          error: `測試分析失敗: ${error.message}`
        });
      }
    }
  });

  // 分析食物圖片API
  fastify.post<{
    Reply: {
      success: boolean;
      data?: {
        analysis: string;
        image_url: string;
      };
      error?: string;
    }
  }>('/api/food/analyze', {
    schema: {
      description: '分析食物圖片',
      tags: ['食物分析'],
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          food_image: {
            type: 'string',
            format: 'binary',
            description: '食物圖片檔案'
          }
        },
        required: ['food_image']
      },
      response: {
        200: {
          description: '分析結果',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                analysis: { type: 'string' },
                image_url: { type: 'string' }
              }
            }
          }
        },
        400: {
          description: '請求錯誤',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        },
        500: {
          description: '服務器錯誤',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        console.log('分析食物圖片API - 處理上傳圖片');
        
        // 確保上傳目錄存在
        const uploadDir = path.join(__dirname, '../..', config.upload.dir);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // 獲取上傳的文件
        const data = await request.file();
        if (!data) {
          return reply.code(400).send({
            success: false,
            error: '請上傳食物圖片'
          });
        }

        // 檢查文件類型
        const fileType = data.mimetype;
        if (!fileType.startsWith('image/')) {
          return reply.code(400).send({
            success: false,
            error: '請上傳有效的圖片文件'
          });
        }

        // 生成唯一文件名
        const timestamp = Date.now();
        const fileExtension = path.extname(data.filename) || '.jpg';
        const fileName = `food_${timestamp}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        // 保存文件到本地臨時目錄
        await pump(data.file, fs.createWriteStream(filePath));
        console.log(`文件已保存到本地臨時目錄: ${filePath}`);

        // 分析食物圖片（實際圖片模式）
        const result = await openaiService.analyzeFoodImage(filePath, false);

        // 獲取 S3 預簽名 URL
        let imageUrl = '';
        if (result.s3ObjectKey) {
          imageUrl = await s3Service.getSignedS3Url(result.s3ObjectKey);
          console.log(`獲取到 S3 預簽名 URL: ${imageUrl.substring(0, 100)}...`);
        }

        // 刪除本地臨時文件
        try {
          fs.unlinkSync(filePath);
          console.log(`本地臨時文件已刪除: ${filePath}`);
        } catch (unlinkError) {
          console.error(`刪除本地臨時文件失敗: ${unlinkError}`);
          // 繼續執行，不中斷流程
        }

        // 返回分析結果
        return {
          success: true,
          data: {
            analysis: result.analysis,
            image_url: imageUrl || `/uploads/${fileName}` // 如果 S3 上傳失敗，使用本地路徑
          }
        };
      } catch (error: any) {
        request.log.error(error);
        return reply.code(500).send({
          success: false,
          error: `分析食物圖片失敗: ${error.message}`
        });
      }
    }
  });
};

export default routes; 