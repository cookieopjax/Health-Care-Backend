// 載入環境變量
import dotenv from 'dotenv';
dotenv.config();

// 定義配置介面
interface ServerConfig {
  port: number;
  host: string;
}

interface LoggerConfig {
  level: string;
  transport?: {
    target: string;
    options?: {
      translateTime: string;
      ignore?: string;
      minimumLevel?: string;
      singleLine?: boolean;
      customPrettifiers?: Record<string, (input: any) => string>;
      messageFormat?: string;
      colorize?: boolean;
    };
  };
  serializers?: {
    req?: (req: any) => any;
    res?: (res: any) => any;
  };
}

interface OpenAIConfig {
  apiKey: string | undefined;
  model: string;
}

interface UploadConfig {
  dir: string;
  limits: {
    fileSize: number;
  };
}

// 新增 JWT 配置介面
interface JWTConfig {
  secret: string;
  expiresIn: string;
}

// 新增 AWS S3 配置介面
interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  urlExpirationSeconds: number;
}

interface Config {
  server: ServerConfig;
  logger: LoggerConfig;
  openai: OpenAIConfig;
  upload: UploadConfig;
  s3: S3Config; // 新增 S3 配置
  jwt: JWTConfig; // 新增 JWT 配置
}

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
      req: (req) => ({
        method: req.method,
        url: req.url
      }),
      res: (res) => ({
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