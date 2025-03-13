# 飲食管家後端服務

這是一個基於 Fastify 框架開發的後端服務，提供飲食管理相關的 API 服務。

## 功能

- 根路由(`/`)：檢查服務狀態
- API文檔：使用Swagger提供的交互式API文檔
- 食物分析：使用ChatGPT Vision API分析食物照片的熱量和營養成分

## 技術棧

- **執行環境**: Node.js >= 22.12.0
- **套件管理**: pnpm >= 9.15.2
- **主要框架**: Fastify
- **資料庫**: Prisma ORM
- **API 文件**: Swagger UI
- **檔案儲存**: AWS S3
- **開發工具**:
  - TypeScript
  - ESLint
  - Vitest (單元測試)

## 專案結構

```
src/
├── config.ts          # 環境配置
├── server.ts          # 應用程式入口
├── swagger-config.ts  # Swagger 配置
├── lib/              # 共用函式庫
├── plugins/          # Fastify 插件
├── routes/           # API 路由
├── services/         # 業務邏輯
├── types/            # TypeScript 型別定義
└── utils/            # 工具函數
```

## 安裝

1. 安裝依賴套件：

```bash
pnpm install
```

2. 設定環境變數：

```bash
cp .env.example .env
```

3. 設定資料庫：

```bash
pnpm prisma generate
pnpm prisma migrate deploy
```

## 開發

啟動開發伺服器：

```bash
pnpm dev
```

## 建置

建置專案：

```bash
pnpm build
```

## 測試

執行測試：

```bash
# 執行所有測試
pnpm test

# 監視模式
pnpm test:watch

# 產生測試覆蓋率報告
pnpm test:coverage
```

## 程式碼品質

執行 ESLint：

```bash
pnpm lint
```

## Docker 部署

使用 Docker 建置映像：

```bash
docker build -t health-care-backend .
```

執行容器：

```bash
docker run -p 3000:3000 health-care-backend
```

## API 文件

啟動服務後，可透過以下路徑存取 Swagger UI：

```
http://localhost:3000/api-docs
```

## 環境變數

主要環境變數說明：

- `PORT`: 服務埠號
- `DATABASE_URL`: 資料庫連線字串
- `JWT_SECRET`: JWT 密鑰
- `AWS_ACCESS_KEY_ID`: AWS 存取金鑰 ID
- `AWS_SECRET_ACCESS_KEY`: AWS 密鑰
- `AWS_REGION`: AWS 區域
- `AWS_BUCKET_NAME`: S3 儲存桶名稱

## 授權

MIT

## 配置

在運行服務之前，請先配置環境變量。創建一個`.env`文件，並設置以下變量：

```
# 服務配置
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# OpenAI API配置
OPENAI_API_KEY=your_openai_api_key_here

# 上傳文件配置
UPLOAD_DIR=uploads
```

**注意**：請將`your_openai_api_key_here`替換為您的OpenAI API密鑰。

## 啟動服務

### 開發模式

```bash
pnpm dev
```

### 生產模式

```bash
pnpm start
```

## 配置

服務配置位於 `config.js` 文件中，可以通過環境變量進行覆蓋：

- `PORT`: 服務器端口（默認：3000）
- `HOST`: 服務器主機（默認：0.0.0.0）
- `LOG_LEVEL`: 日誌級別（默認：info）
- `NODE_ENV`: 環境（設置為 `production` 時會禁用美化日誌輸出）
- `OPENAI_API_KEY`: OpenAI API密鑰
- `UPLOAD_DIR`: 上傳文件存儲目錄（默認：uploads）

## API文檔

啟動服務後，可以通過訪問以下URL查看API文檔：

```
http://localhost:3000/docs
```

這是一個交互式的Swagger文檔，您可以直接在瀏覽器中測試API。

## API端點

### 檢查服務狀態

- **URL**: `/`
- **方法**: `GET`
- **響應示例**:
  ```json
  {
    "status": "ok",
    "message": "服務正常運行中",
    "timestamp": "2023-06-01T12:00:00.000Z",
    "version": "1.0.0"
  }
  ```

### 分析食物圖片

- **URL**: `/api/food/analyze`
- **方法**: `POST`
- **內容類型**: `multipart/form-data`
- **參數**:
  - `food_image`: 食物圖片文件
- **響應示例**:
  ```json
  {
    "analysis": "這是一份漢堡套餐，包含漢堡、薯條和可樂。估計熱量約為800-1000卡路里。漢堡中含有約30克蛋白質、45克脂肪和60克碳水化合物。這是一份高熱量、高脂肪的食物，建議偶爾食用，不宜經常食用。",
    "image_url": "/uploads/food_1677123456789.jpg"
  }
  ```

## 技術棧

- [Fastify](https://www.fastify.io/) - 高效能的Web框架
- [Pino](https://getpino.io/) - 超快的Node.js日誌庫
- [Swagger](https://swagger.io/) - API文檔工具
- [OpenAI](https://openai.com/) - ChatGPT Vision API用於圖片分析 