# 建置階段
FROM node:22.12.0-slim AS builder

# 安裝 pnpm
RUN corepack enable && corepack prepare pnpm@9.15.2 --activate

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 複製 Prisma schema
COPY prisma ./prisma/

# 安裝依賴
RUN pnpm install --frozen-lockfile

# 生成 Prisma Client
RUN pnpm prisma generate

# 複製原始碼
COPY . .

# 建置
RUN pnpm build

# 生產階段
FROM node:22.12.0-slim AS production

# 安裝 pnpm
RUN corepack enable && corepack prepare pnpm@9.15.2 --activate

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 複製 Prisma schema
COPY prisma ./prisma/

# 只安裝生產環境依賴
RUN pnpm install --frozen-lockfile --prod

# 生成 Prisma Client
RUN pnpm prisma generate

# 從建置階段複製建置後的檔案
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 設定環境變數
ENV NODE_ENV=production

# 暴露埠口
EXPOSE 3000

# 啟動應用
CMD ["node", "dist/server.js"] 