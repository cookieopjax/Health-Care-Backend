// 載入環境變量
import dotenv from 'dotenv';
import type { Config } from './types/config.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

dotenv.config();

// 服務配置
const config: Config = {
  // 服務器配置
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0'
  },
  
  // 日誌配置
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname,reqId,responseTime',
        singleLine: true,
        minimumLevel: 'info',
        messageFormat: '{msg}',
        colorize: true
      }
    } : undefined,
    serializers: {
      req: (req: FastifyRequest) => ({
        method: req.method,
        url: req.url
      }),
      res: (res: FastifyReply) => ({
        statusCode: res.statusCode
      })
    }
  },

  // OpenAI配置
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini'
  },

  // 上傳文件配置
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  },
  
  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-default-secret-key',
    expiresIn: '7d'
  },

  // AWS S3 配置
  s3: {
    region: process.env.AWS_REGION || 'ap-northeast-1',
    bucket: process.env.AWS_S3_BUCKET || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    urlExpirationSeconds: parseInt(process.env.AWS_URL_EXPIRATION_SECONDS || '3600', 10)
  }
};

export default config; 