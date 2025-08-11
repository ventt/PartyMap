# ---- Base builder image ----
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
# Copy package manifests
COPY package.json pnpm-lock.yaml* ./
# Enable corepack and install deps (use lockfile if present)
RUN corepack enable && pnpm install --frozen-lockfile

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm run build

# Prune dev dependencies to reduce final image size
RUN corepack enable && pnpm prune --prod

# ---- Production image ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy production node_modules and standalone output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./next.config.mjs

ENV PORT=3000
EXPOSE 3000
USER nextjs
CMD ["node", "server.js"]
