// Swagger配置
import { FastifyRequest, FastifyReply } from 'fastify';
import { SwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

// 定義 Swagger 配置介面
interface SwaggerInfo {
  title: string;
  description: string;
  version: string;
}

interface ExternalDocs {
  url: string;
  description: string;
}

interface Tag {
  name: string;
  description: string;
}

interface SwaggerConfig {
  info: SwaggerInfo;
  externalDocs: ExternalDocs;
  host: string;
  schemes: string[];
  consumes: string[];
  produces: string[];
  tags: Tag[];
  components: {
    schemas: {
      fileUploadSchema: {
        type: string;
        properties: {
          food_image: {
            type: string;
            format: string;
            description: string;
          };
        };
        required: string[];
      };
    };
  };
}

interface UIConfig {
  docExpansion: string;
  deepLinking: boolean;
  supportedSubmitMethods: string[];
  defaultModelsExpandDepth: number;
  defaultModelExpandDepth: number;
  displayRequestDuration: boolean;
}

interface UIHooks {
  onRequest: (request: FastifyRequest, reply: FastifyReply, next: () => void) => void;
  preHandler: (request: FastifyRequest, reply: FastifyReply, next: () => void) => void;
}

interface SwaggerUIConfig {
  routePrefix: string;
  uiConfig: UIConfig;
  uiHooks: UIHooks;
  staticCSP: boolean;
  transformStaticCSP: (header: string) => string;
}

interface Config {
  swagger: SwaggerConfig;
  swaggerUI: SwaggerUIConfig;
}

// 配置對象
const config = {
  // Swagger文檔配置
  swagger: {
    openapi: '3.0.0',
    info: {
      title: '健康照護後端API',
      description: '健康照護系統的後端API文檔',
      version: '1.0.0'
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: '查找更多關於Swagger的信息'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '本地開發伺服器'
      }
    ],
    consumes: ['application/json', 'multipart/form-data'],
    produces: ['application/json'],
    tags: [
      { name: '系統', description: '系統相關API' },
      { name: '食物分析', description: '食物圖片分析相關API' },
      { name: '認證', description: '使用者認證相關API' }
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
    }
  } as SwaggerOptions,
  
  // Swagger UI配置
  swaggerUI: {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list' as 'list' | 'full' | 'none',
      deepLinking: true,
      supportedSubmitMethods: ['get', 'put', 'post', 'delete', 'options', 'head', 'patch'],
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      displayRequestDuration: true
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header: string) => header
  } as FastifySwaggerUiOptions
};

export default config; 