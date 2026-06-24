FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set dummy environment variables to satisfy build-time checks (overridden at runtime)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NEXTAUTH_SECRET="dummy_secret_for_build"
ENV NEXT_TELEMETRY_DISABLED 1

# Declare build arguments for Kkiapay public variables (baked into frontend bundle)
ARG NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY
ARG NEXT_PUBLIC_KKIAPAY_ENVIRONMENT

ENV NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY=$NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY
ENV NEXT_PUBLIC_KKIAPAY_ENVIRONMENT=$NEXT_PUBLIC_KKIAPAY_ENVIRONMENT

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js in production mode (outputs to .next/standalone)
RUN npm run build

# Production runner image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Install prisma CLI and tsx globally to allow running database migrations and seeds in production
RUN npm install -g prisma@7.8.0 tsx

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets, prisma config, and standalone outputs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib

# Copy all node_modules from builder to support seeding and database driver adapters
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy startup script and make it executable
COPY --chown=nextjs:nodejs entrypoint.sh ./
RUN chmod +x entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

ENTRYPOINT ["/app/entrypoint.sh"]
