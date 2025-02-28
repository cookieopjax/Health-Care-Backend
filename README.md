# 健康照護後端服務

這是一個使用Fastify框架構建的基礎後端服務。

## 功能

- 根路由(`/`)：檢查服務狀態
- API文檔：使用Swagger提供的交互式API文檔
- 食物分析：使用ChatGPT Vision API分析食物照片的熱量和營養成分

## 安裝

確保您已安裝Node.js和npm/pnpm，然後執行：

```bash
# 使用npm
npm install

# 或使用pnpm
pnpm install
```

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
# 使用npm
npm run dev

# 或使用pnpm
pnpm dev
```

### 生產模式

```bash
# 使用npm
npm start

# 或使用pnpm
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
http://localhost:3000/documentation
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
    "success": true,
    "data": {
      "analysis": "這是一份漢堡套餐，包含漢堡、薯條和可樂。估計熱量約為800-1000卡路里。漢堡中含有約30克蛋白質、45克脂肪和60克碳水化合物。這是一份高熱量、高脂肪的食物，建議偶爾食用，不宜經常食用。",
      "image_url": "/uploads/food_1677123456789.jpg"
    }
  }
  ```

## 技術棧

- [Fastify](https://www.fastify.io/) - 高效能的Web框架
- [Pino](https://getpino.io/) - 超快的Node.js日誌庫
- [Swagger](https://swagger.io/) - API文檔工具
- [OpenAI](https://openai.com/) - ChatGPT Vision API用於圖片分析 