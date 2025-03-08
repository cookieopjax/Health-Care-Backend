// AWS S3 服務
import fs from 'fs'
import path from 'path'
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand,
  DeleteObjectCommand 
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import config from '../config.js'

// 創建 S3 客戶端
const s3Client = new S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey
  },
  // 添加更多配置以確保正確的認證
  forcePathStyle: false, // 使用虛擬託管樣式 URL
  apiVersion: '2006-03-01' // 指定 API 版本
})

/**
 * 上傳文件到 S3
 * @param {string} filePath - 本地文件路徑
 * @param {string} contentType - 文件類型
 * @returns {Promise<string>} - S3 對象鍵
 */
export async function uploadFileToS3(filePath: string, contentType: string): Promise<string> {
  try {
    // 讀取文件
    const fileContent = fs.readFileSync(filePath)
    
    // 生成唯一的對象鍵
    const timestamp = Date.now()
    const fileName = path.basename(filePath)
    const objectKey = `public/${timestamp}-${fileName}`
    
    console.log(`準備上傳到 S3 - 存儲桶: ${config.s3.bucket}, 對象鍵: ${objectKey}`)
    console.log(`區域: ${config.s3.region}, 認證: ${config.s3.accessKeyId.substring(0, 5)}...`)
    
    // 創建上傳命令
    const command = new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: objectKey,
      Body: fileContent,
      ContentType: contentType
    })
    
    // 執行上傳
    await s3Client.send(command)
    console.log(`文件已上傳到 S3: ${objectKey}`)
    
    return objectKey
  } catch (error: any) {
    console.error(`上傳文件到 S3 失敗: ${error.message}`)
    console.error(`錯誤詳情:`, error)
    throw new Error(`上傳文件到 S3 失敗: ${error.message}`)
  }
}

/**
 * 獲取 S3 對象的預簽名 URL
 * @param {string} objectKey - S3 對象鍵
 * @returns {Promise<string>} - 預簽名 URL
 */
export async function getSignedS3Url(objectKey: string): Promise<string> {
  try {
    // 創建獲取對象命令
    const command = new GetObjectCommand({
      Bucket: config.s3.bucket,
      Key: objectKey
    })
    
    // 生成預簽名 URL
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: config.s3.urlExpirationSeconds
    })
    
    return signedUrl
  } catch (error: any) {
    console.error(`獲取 S3 預簽名 URL 失敗: ${error.message}`)
    throw new Error(`獲取 S3 預簽名 URL 失敗: ${error.message}`)
  }
}

/**
 * 刪除 S3 對象
 * @param {string} objectKey - S3 對象鍵
 * @returns {Promise<void>}
 */
export async function deleteS3Object(objectKey: string): Promise<void> {
  try {
    // 創建刪除對象命令
    const command = new DeleteObjectCommand({
      Bucket: config.s3.bucket,
      Key: objectKey
    })
    
    // 執行刪除
    await s3Client.send(command)
    console.log(`S3 對象已刪除: ${objectKey}`)
  } catch (error: any) {
    console.error(`刪除 S3 對象失敗: ${error.message}`)
    throw new Error(`刪除 S3 對象失敗: ${error.message}`)
  }
} 