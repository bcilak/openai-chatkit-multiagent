# Next.js + SQLite için Dockerfile
FROM node:20 AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source
COPY . .

# Build application
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

# Create data directory for SQLite database
RUN mkdir -p /app/data && chmod 700 /app/data

# Set proper permissions
RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["npm", "start"]
