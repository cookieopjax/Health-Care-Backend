import { Static, Type } from '@sinclair/typebox'

// 註冊請求的型別定義
export const RegisterSchema = Type.Object({
  username: Type.String({ minLength: 3, maxLength: 50 }),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 })
})

// 登入請求的型別定義
export const LoginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String()
})

// 更新使用者資料請求的型別定義
export const UpdateUserSchema = Type.Object({
  username: Type.Optional(Type.String({ minLength: 3, maxLength: 50 })),
  email: Type.Optional(Type.String({ format: 'email' })),
  password: Type.Optional(Type.String({ minLength: 6 }))
})

// 匯出型別
export type RegisterRequest = Static<typeof RegisterSchema>
export type LoginRequest = Static<typeof LoginSchema>
export type UpdateUserRequest = Static<typeof UpdateUserSchema>

// JWT 權杖的型別定義
export interface JWTPayload {
  userId: string
  email: string
}

// JWT 權杖的完整型別定義（包含 JWT 標準欄位）
export interface JWTFullPayload extends JWTPayload {
  iat: number
  exp: number
}

// JWT 權杖的簽名和驗證型別
export interface JWT {
  sign: (payload: JWTPayload, options?: { expiresIn?: string }) => string
  verify: <T = JWTFullPayload>(token: string) => T
  decode: <T = JWTFullPayload>(token: string) => T
} 