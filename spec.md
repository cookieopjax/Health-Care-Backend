# 飲食管家後端服務規格文件

## 1. 系統概述

### 1.1 專案目的
開發一個高效能的飲食管理後端服務，提供食物分析、營養追蹤等功能，協助使用者更好地管理飲食健康。

### 1.2 技術需求

#### 1.2.1 基礎環境
- Node.js >= 22.12.0
- pnpm >= 9.15.2
- TypeScript
- ESModule

#### 1.2.2 主要框架與工具
- Fastify v5.2.1
- Prisma v6.4.1
- AWS SDK v3.758.0
- OpenAI API（Vision）

#### 1.2.3 開發工具
- ESLint v9.22.0
- Vitest v3.0.7
- TypeBox

## 2. 系統架構

### 2.1 核心模組
```
src/
├── config/           # 系統配置
├── plugins/          # Fastify 插件
├── routes/           # API 路由
├── services/         # 業務邏輯
├── lib/             # 共用函式庫
├── types/           # TypeScript 型別
└── utils/           # 工具函數
```

### 2.2 資料儲存
- 主要資料庫：PostgreSQL（透過 Prisma ORM）
- 檔案儲存：AWS S3

## 3. API 規格

### 3.1 API 回應格式

#### 3.1.1 成功回應
```typescript
// 回傳單一資料
{
    欄位1: 值1,
    欄位2: 值2,
    ...
}

// 回傳陣列資料
[
    {
        欄位1: 值1,
        欄位2: 值2,
        ...
    },
    ...
]
```

#### 3.1.2 錯誤回應
```typescript
{
    msg: string  // 錯誤訊息
}
```

#### 3.1.3 HTTP 狀態碼
- 200：請求成功
- 201：創建成功
- 400：請求格式錯誤
- 401：未授權
- 403：禁止訪問
- 404：資源不存在
- 500：伺服器錯誤

#### 3.1.4 範例

成功回應：
```typescript
// GET /api/users/123
{
    id: "123",
    name: "王小明",
    email: "test@example.com"
}

// GET /api/foods
[
    {
        id: "1",
        name: "漢堡",
        calories: 500
    },
    {
        id: "2",
        name: "沙拉",
        calories: 300
    }
]
```

錯誤回應：
```typescript
// 400 Bad Request
{
    msg: "請上傳圖片檔案"
}

// 401 Unauthorized
{
    msg: "請先登入"
}

// 404 Not Found
{
    msg: "找不到該筆資料"
}
```

### 3.2 API 端點

#### 3.2.1 系統狀態
```
GET /
回應格式：
{
    "status": "ok",
    "message": "服務正常運行中",
    "timestamp": "ISO 8601格式",
    "version": "版本號"
}
```

#### 3.2.2 食物分析
```
POST /api/food/analyze
Content-Type: multipart/form-data

請求參數：
- food_image: File（必須）

回應格式：
{
    "analysis": "分析結果文字描述",
    "image_url": "已上傳圖片的URL",
    "nutrition": {
        "calories": number,
        "protein": number,
        "fat": number,
        "carbohydrates": number
    }
}
```

## 4. 安全規格

### 4.1 API 安全
- 所有 API 請求必須使用 HTTPS
- 實作 CORS 保護
- 實作 Rate Limiting
- 檔案上傳大小限制：10MB

### 4.2 資料安全
- 密碼雜湊：使用 bcrypt
- 敏感資訊加密：使用 AES-256
- API 金鑰儲存：環境變數

## 5. 效能規格

### 5.1 回應時間
- API 回應時間 < 200ms（不含外部服務）
- 圖片分析回應時間 < 5s
- 並發請求處理：> 1000 req/s

### 5.2 可用性
- 服務可用性：99.9%
- 自動錯誤回復機制
- 系統監控與警報

## 6. 部署規格

### 6.1 容器化
```dockerfile
Node.js 基礎映像：node:22-alpine
容器記憶體限制：512MB
容器 CPU 限制：2 cores
```

### 6.2 環境變數
```
必要環境變數：
- PORT
- DATABASE_URL
- JWT_SECRET
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- AWS_BUCKET_NAME
- OPENAI_API_KEY
```

## 7. 監控規格

### 7.1 日誌
- 使用 Pino 日誌系統
- 日誌級別：development 為 debug，production 為 info
- 日誌格式：JSON

### 7.2 監控指標
- API 回應時間
- 錯誤率
- 系統資源使用率
- 並發連接數

## 8. 測試規格

### 8.1 單元測試
- 使用 Vitest
- 測試覆蓋率要求：> 80%
- 必要測試範圍：
  - 路由處理
  - 業務邏輯
  - 資料驗證

### 8.2 整合測試
- API 端點測試
- 資料庫操作測試
- 外部服務整合測試

## 9. 文件規格

### 9.1 API 文件
- 使用 Swagger/OpenAPI 3.0
- 包含請求/回應範例
- 錯誤碼說明

### 9.2 程式碼文件
- 使用 TypeScript JSDoc
- 必要文件項目：
  - 函數用途
  - 參數說明
  - 回傳值說明
  - 錯誤處理說明 