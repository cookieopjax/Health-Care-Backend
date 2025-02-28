// OpenAI服務
import fs from 'fs';
import config from '../config.js';
import { writeFile } from 'fs/promises';
import * as s3Service from './s3-service.js';
import path from 'path';

// 定義 OpenAI API 的基本 URL
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// 定義分析結果介面
interface AnalysisResult {
  analysis: string;
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
 * @param {boolean} isTestMode - 是否為測試模式
 * @returns {Promise<AnalysisResult>} - 分析結果
 */
async function analyzeFoodImage(imagePath: string, isTestMode = false): Promise<AnalysisResult> {
  try {
    console.log('---------analyzeFoodImage---------');
    console.log(`圖片路徑: ${imagePath}`);
    console.log(`測試模式: ${isTestMode}`);
    
    // 測試模式或實際圖片模式
    if (isTestMode || imagePath === 'test_image_path') {
      console.log('測試模式：不使用實際圖片');
      
      // 準備請求內容 (純文字模式，用於測試)
      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '假設這是一張雞肉沙拉的照片，請分析它的熱量和營養成分。'
            }
          ]
        }
      ];
      
      // 調用 OpenAI API (使用原生 fetch)
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
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API 錯誤: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();

      // 返回分析結果
      return {
        analysis: data.choices[0].message.content || '無法分析圖片',
        usage: data.usage
      };
    } else {
      console.log('實際圖片模式：使用上傳的圖片');
      
      // 檢查文件是否存在
      if (!fs.existsSync(imagePath)) {
        console.error(`圖片文件不存在: ${imagePath}`);
        throw new Error(`圖片文件不存在: ${imagePath}`);
      }
      
      // 獲取文件大小
      const stats = fs.statSync(imagePath);
      console.log(`圖片大小: ${stats.size} 字節`);
      
      // 檢查文件大小是否過大
      if (stats.size > 20 * 1024 * 1024) { // 20MB
        console.error(`圖片文件過大: ${stats.size} 字節`);
        throw new Error(`圖片文件過大，請上傳小於 20MB 的圖片`);
      }

      try {
        // 獲取文件類型
        const fileExtension = path.extname(imagePath).toLowerCase();
        let contentType = 'image/jpeg'; // 預設為 JPEG
        
        if (fileExtension === '.png') {
          contentType = 'image/png';
        } else if (fileExtension === '.gif') {
          contentType = 'image/gif';
        } else if (fileExtension === '.webp') {
          contentType = 'image/webp';
        }
        
        // 上傳圖片到 S3
        console.log('上傳圖片到 S3...');
        const objectKey = await s3Service.uploadFileToS3(imagePath, contentType);
        console.log(`圖片已上傳到 S3，對象鍵: ${objectKey}`);
        
        // 獲取預簽名 URL
        const imageUrl = await s3Service.getSignedS3Url(objectKey);
        console.log('圖片URL:', imageUrl);

        // 構建請求內容 - 使用 S3 URL 而不是 Base64
        const messages = [
          {
            role: 'user' as const,
            content: [
              {
                type: 'text' as const,
                text: '請分析這張食物圖片的內容，告訴我這是什麼食物，並估算它的熱量和主要營養成分。'
              },
              {
                type: 'image_url' as const,
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ];
        
        console.log('準備調用 OpenAI API...', messages);
        // 調用 OpenAI API (使用原生 fetch)
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
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `OpenAI API 錯誤: ${response.status}`;
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage += ` - ${JSON.stringify(errorData)}`;
          } catch (e) {
            errorMessage += ` - ${errorText}`;
          }
          
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        console.log('OpenAI API 調用成功');
        console.log(`回應內容: ${data.choices[0].message.content}`);

        // 返回分析結果，包含 S3 對象鍵
        return {
          analysis: data.choices[0].message.content || '無法分析圖片',
          usage: data.usage,
          s3ObjectKey: objectKey
        };
      } catch (readError: any) {
        console.error('處理圖片時出錯:', readError);
        throw new Error(`處理圖片失敗: ${readError.message}`);
      }
    }
  } catch (error: any) {
    console.error('分析食物圖片時出錯:', error);
    console.error('錯誤詳情:', error.stack);
    
    // 檢查是否為 API 錯誤
    if (error.message.includes('OpenAI API 錯誤')) {
      console.error('API 錯誤詳情:', error.message);
    }
    
    throw new Error(`分析食物圖片失敗: ${error.message}`);
  }
}

export { analyzeFoodImage }; 