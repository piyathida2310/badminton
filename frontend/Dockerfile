# ----------------------
# 1. Build Next.js
# ----------------------
FROM node:22-slim AS builder

WORKDIR /app



COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build


# ----------------------
# 2. Production (Next.js server)
# ----------------------
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]