# Build stage
FROM node:22 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:22-slim

# Instala o Blender e dependências gráficas
RUN apt-get update && apt-get install -y \
    blender \
    libglu1-mesa \
    libxi6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/convert.py ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/vite.config.ts ./

# Instala apenas dependências de produção
RUN npm install --omit=dev && npm install -g tsx

# Cria pastas de trabalho
RUN mkdir -p uploads outputs

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["tsx", "server.ts"]
