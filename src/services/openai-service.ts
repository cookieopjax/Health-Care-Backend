// OpenAI服務
import fs from 'fs'
import config from '../config.js'
import { writeFile } from 'fs/promises'
import * as s3Service from './s3-service.js'
import path from 'path'

// 定義 OpenAI API 的基本 URL
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

const exampleObject = {
  "isFood": true,
  "name": "食物名稱",
  "nutrition": {
    "calories": 2000,
    "protein": 75,
    "carbs": 250,
    "fat": 60,
    "fiber": 10,
    "sugar": 20,
    "sodium": 1000
  }
}
const analysisPrompt = `
  你是一個專業的營養師，請分析以下食物圖片，並給出食物的營養成分和熱量
  若你判斷是範圍區間，請直接取平均值
  如果圖片不是食物，isFood 為 false
  如果圖片是食物，isFood 為 true
  請以 JSON 格式返回分析結果，任何其他文字都不要回傳
  格式如以下範例：
  ${JSON.stringify(exampleObject)}
`

// 定義分析結果介面
interface AnalysisResult {
  analysis: object;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  s3ObjectKey?: string; // 新增 S3 對象鍵
}

// 定義 OpenAI API 請求介面
interface ChatCompletionMessageParam {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
      detail?: 'low' | 'high' | 'auto';
    };
  }>;
}

/**
 * 分析食物圖片
 * @param {string} imagePath - 圖片路徑
 * @returns {Promise<AnalysisResult>} - 分析結果
 */
async function analyzeFoodImage(imagePath: string): Promise<AnalysisResult> {
  try {
    return await processImage(imagePath)
  } catch (error: any) {
    throw new Error(`分析食物圖片失敗: ${error.message}`)
  }
}

/**
 * 處理圖片分析
 * @param {string} imagePath - 圖片路徑
 * @returns {Promise<AnalysisResult>} - 分析結果
 */
async function processImage(imagePath: string): Promise<AnalysisResult> {
  // 檢查文件是否存在
  if (!fs.existsSync(imagePath)) {
    throw new Error(`圖片文件不存在: ${imagePath}`)
  }
  
  // 獲取文件大小並檢查
  const stats = fs.statSync(imagePath)
  if (stats.size > 20 * 1024 * 1024) { // 20MB
    throw new Error(`圖片文件過大，請上傳小於 20MB 的圖片`)
  }

  // 獲取文件類型
  const contentType = getImageContentType(imagePath)
  
  // 上傳圖片到 S3
  const objectKey = await s3Service.uploadFileToS3(imagePath, contentType)
  
  // 獲取預簽名 URL
  const imageUrl = await s3Service.getSignedS3Url(objectKey)

  // 構建請求內容
  const messages = createImageAnalysisMessages(imageUrl)
  
  // 調用 OpenAI API
  const data = await callOpenAIAPI(messages)
  
  const analysisResult = data.choices[0].message.content

  const cleanedString = analysisResult.replace(/^```json\n/, '').replace(/\n```$/, '')
  const analysisResultObject = JSON.parse(cleanedString)

  console.log(analysisResultObject)

  // 返回分析結果，包含 S3 對象鍵
  return {
    analysis: analysisResultObject || '無法分析圖片',
    usage: data.usage,
    s3ObjectKey: objectKey
  }
}

/**
 * 根據文件擴展名獲取內容類型
 * @param {string} imagePath - 圖片路徑
 * @returns {string} - 內容類型
 */
function getImageContentType(imagePath: string): string {
  const fileExtension = path.extname(imagePath).toLowerCase()
  
  switch (fileExtension) {
    case '.png':
      return 'image/png'
    case '.gif':
      return 'image/gif'
    case '.webp':
      return 'image/webp'
    default:
      return 'image/jpeg' // 預設為 JPEG
  }
}

/**
 * 創建圖片分析的消息內容
 * @param {string} imageUrl - 圖片 URL
 * @returns {ChatCompletionMessageParam[]} - 消息內容
 */
function createImageAnalysisMessages(imageUrl: string): ChatCompletionMessageParam[] {
  return [
    {
      role: 'user' as const,
      content: [
        {
          type: 'text' as const,
          text: analysisPrompt
        },
        {
          type: 'image_url' as const,
          image_url: {
            url: imageUrl
          }
        }
      ]
    }
  ]
}

/**
 * 調用 OpenAI API
 * @param {any} messages - 消息內容
 * @returns {Promise<any>} - API 回應
 */
async function callOpenAIAPI(messages: any): Promise<any> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.openai.apiKey}`
    },
    body: JSON.stringify({
      model: config.openai.model,
      messages,
      max_tokens: 1000
    })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `OpenAI API 錯誤: ${response.status}`
    
    try {
      const errorData = JSON.parse(errorText)
      errorMessage += ` - ${JSON.stringify(errorData)}`
    } catch (e) {
      errorMessage += ` - ${errorText}`
    }
    
    throw new Error(errorMessage)
  }
  
  const data = await response.json()
  return data
}

export { analyzeFoodImage } 