// 引入配置
import config from './config.js';
import swaggerConfig from './swagger-config.js';
import path from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import routes from './routes/index.js';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { AddressInfo } from 'net';

// 獲取當前文件的目錄路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 創建 Fastify 實例並使用 TypeBox 類型提供者
const fastify = Fastify({ 
  logger: config.logger 
}).withTypeProvider<TypeBoxTypeProvider>();

// 註冊 CORS，設定為全開（開發階段測試用）
fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'Content-Length', 'Content-Disposition'],
  exposedHeaders: ['Content-Disposition'],
  credentials: true
});

// 註冊靜態文件服務
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/'
});

// 註冊Swagger插件
fastify.register(fastifySwagger, {
  openapi: {
    info: {
      title: '飲食管家後端API',
      description: '飲食管家系統的後端API文檔',
      version: '1.0.0'
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`,
        description: '本地開發伺服器'
      },
      {
        url: `http://127.0.0.1:${config.server.port}`,
        description: '本地開發伺服器 (IP)'
      }
    ],
    components: {
      schemas: {
        fileUploadSchema: {
          type: 'object',
          properties: {
            food_image: {
              type: 'string',
              format: 'binary',
              description: '食物圖片檔案'
            }
          },
          required: ['food_image']
        }
      }
    },
    tags: [
      { name: '系統', description: '系統相關API' },
      { name: '食物分析', description: '食物圖片分析相關API' }
    ]
  }
});

fastify.register(fastifySwaggerUI, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    displayRequestDuration: true
  },
  staticCSP: true
});

// 註冊路由
fastify.register(routes);

// 啟動服務器
const start = async (): Promise<void> => {
  try {
    // 使用配置中的端口和主機
    await fastify.listen({ 
      port: config.server.port, 
      host: '0.0.0.0' // 接受來自所有 IP 的連接
    });
    
    console.log(`API文檔可在 http://localhost:${config.server.port}/documentation 查看`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// 執行服務器
start(); 