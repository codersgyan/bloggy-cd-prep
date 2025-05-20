# Stage 1: Build
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts
# Copy app files
COPY . .

# If you have a build step (uncomment next line)
RUN npm run build

RUN npm prune --omit=dev

# Stage 2: Production image
FROM node:20-slim AS runner

WORKDIR /app

# Copy production dependencies and built app from builder
COPY --from=builder /app/dist ./
COPY --from=builder /app/node_modules ./node_modules
COPY wait-for-it.sh /usr/local/bin/wait-for-it.sh

RUN chmod +x /usr/local/bin/wait-for-it.sh

EXPOSE 3000

RUN useradd -m appuser
USER appuser

ENTRYPOINT ["wait-for-it.sh", "blog-db:3306", "--"]
CMD ["node", "index.js"]
