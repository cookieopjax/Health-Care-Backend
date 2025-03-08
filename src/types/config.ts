// 伺服器配置介面
export interface ServerConfig {
  port: number;
  host: string;
}

// 日誌配置介面
export interface LoggerConfig {
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

// OpenAI 配置介面
export interface OpenAIConfig {
  apiKey: string | undefined;
  model: string;
}

// 上傳配置介面
export interface UploadConfig {
  dir: string;
  limits: {
    fileSize: number;
  };
}

// JWT 配置介面
export interface JWTConfig {
  secret: string;
  expiresIn: string;
}

// AWS S3 配置介面
export interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  urlExpirationSeconds: number;
}

// 總配置介面
export interface Config {
  server: ServerConfig;
  logger: LoggerConfig;
  openai: OpenAIConfig;
  upload: UploadConfig;
  s3: S3Config;
  jwt: JWTConfig;
} 