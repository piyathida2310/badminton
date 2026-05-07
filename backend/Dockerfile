# ----------------------
# 1. Build stage
# ----------------------
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./

# ใช้ npm ci เพื่อความ deterministic
RUN npm ci

# copy prisma ก่อน (optimize cache)
COPY prisma ./prisma

# generate prisma client
RUN npx prisma generate

# copy source
COPY . .

# build app (เช่น NestJS / Next / TS)
RUN npm run build


# ----------------------
# 2. Production stage
# ----------------------
FROM node:20-alpine AS production

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV=production

# copy package.json อย่างเดียวพอ
COPY package*.json ./

# install เฉพาะ production deps
RUN npm ci --omit=dev && npm cache clean --force

# copy build output
COPY --from=builder /app/dist ./dist

# copy prisma client + schema
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 8000

# ใช้ node ตรง ๆ จะเบากว่า
CMD ["node", "dist/src/server.js"]