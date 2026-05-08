# ----------------------
# 1. Build Next.js
# ----------------------
FROM node:22-slim AS builder

WORKDIR /app

# Environment variables for build time (Next.js requires NEXT_PUBLIC_*)
# These are provided as defaults to ensure the build works without extra flags
ARG NEXT_PUBLIC_API_URL="https://judjang.online/api"
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_YXJ0aXN0aWMtcGFudGhlci05NS5jbGVyay5hY2NvdW50cy5kZXYk"
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
ARG NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/sign-in"
ARG NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/sign-in"

# Set them as ENV so Next.js can bake them into the JS bundle during 'npm run build'
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
ENV NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL

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

<<<<<<< HEAD
# Re-declare environment variables for runtime (server-side routes)
ENV NEXT_PUBLIC_API_URL="https://judjang.online"
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_YXJ0aXN0aWMtcGFudGhlci05NS5jbGVyay5hY2NvdW50cy5kZXYk"
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
ENV NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/sign-in"
ENV NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/sign-in"

=======
>>>>>>> parent of 277a53d (Merge pull request #10 from piyathida2310/Sukhatai)
# copy standalone build from builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

# Set sensitive environment variables at runtime via CMD to avoid build-time warnings
CMD ["sh", "-c", "CLERK_SECRET_KEY=sk_test_YEBs76hnbGeC0RC3isKU9YvdhSVeLxFxZT0vy6bfoy node server.js"]