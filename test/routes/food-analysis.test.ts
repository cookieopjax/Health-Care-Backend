// 食物分析路由測試
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FastifyInstance } from 'fastify'
import supertest from 'supertest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import * as openaiService from '../../src/services/openai-service.js'
import * as s3Service from '../../src/services/s3-service.js'
import { createApp } from '../../src/server.js'

// 獲取當前文件的目錄路徑
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 模擬 Fastify 應用
let app: any

// 模擬檔案路徑
const testImagePath = path.join(__dirname, '..', 'fixtures', 'test-food.jpg')

// 確保測試目錄存在
const fixturesDir = path.join(__dirname, '..', 'fixtures')
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true })
}

// 創建測試圖片檔案（如果不存在）
if (!fs.existsSync(testImagePath)) {
  // 創建一個簡單的測試圖片
  const canvas = new Uint8Array([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00,
    0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0x37, 0xff, 0xd9
  ])
  fs.writeFileSync(testImagePath, canvas)
}

// 在測試前動態導入 Fastify 應用
beforeEach(async () => {
  // 模擬 openaiService.analyzeFoodImage
  vi.spyOn(openaiService, 'analyzeFoodImage').mockResolvedValue({
    analysis: '這是一份健康的沙拉，含有雞肉、生菜和番茄。估計熱量約為 250 大卡。',
    usage: {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150
    },
    s3ObjectKey: 'test-food-image.jpg'
  })

  // 模擬 s3Service.getSignedS3Url
  vi.spyOn(s3Service, 'getSignedS3Url').mockResolvedValue('https://example.com/test-food-image.jpg')

  // 創建 Fastify 應用
  app = await createApp()
})

// 在每個測試後清理
afterEach(() => {
  vi.restoreAllMocks()
  if (app && typeof app.close === 'function') {
    app.close()
  }
})

describe('食物分析路由測試', () => {
  it('應該返回 400 錯誤，當沒有上傳圖片時', async () => {
    const response = await supertest(app.server)
      .post('/api/food/analyze')
      .expect(400) // 現在應該返回 400 錯誤

    expect(response.body).toEqual({
      msg: '請上傳食物圖片，並確保請求格式正確'
    })
  })

  it('應該返回 400 錯誤，當上傳的不是圖片檔案時', async () => {
    const response = await supertest(app.server)
      .post('/api/food/analyze')
      .attach('food_image', Buffer.from('這不是圖片'), {
        filename: 'test.txt',
        contentType: 'text/plain'
      })
      .expect(400)

    expect(response.body).toEqual({
      msg: '請上傳有效的圖片文件'
    })
  })

  it('應該成功分析食物圖片並返回結果', async () => {
    const response = await supertest(app.server)
      .post('/api/food/analyze')
      .attach('food_image', testImagePath)
      .expect(200)

    expect(response.body).toEqual({
      data: {
        analysis: '這是一份健康的沙拉，含有雞肉、生菜和番茄。估計熱量約為 250 大卡。',
        image_url: 'https://example.com/test-food-image.jpg'
      }
    })

    // 驗證 openaiService.analyzeFoodImage 被調用
    expect(openaiService.analyzeFoodImage).toHaveBeenCalled()
    
    // 驗證 s3Service.getSignedS3Url 被調用
    expect(s3Service.getSignedS3Url).toHaveBeenCalledWith('test-food-image.jpg')
  })

  it('應該處理分析過程中的錯誤', async () => {
    // 模擬 openaiService.analyzeFoodImage 拋出錯誤
    vi.spyOn(openaiService, 'analyzeFoodImage').mockRejectedValueOnce(new Error('分析失敗'))

    const response = await supertest(app.server)
      .post('/api/food/analyze')
      .attach('food_image', testImagePath)
      .expect(500)

    expect(response.body).toEqual({
      msg: expect.stringContaining('分析食物圖片失敗')
    })
  })
}) 