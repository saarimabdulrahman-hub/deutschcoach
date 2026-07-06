FROM node:22-slim

WORKDIR /app

# Copy monorepo root configs
COPY package.json package-lock.json ./

# Copy shared packages (needed by web)
COPY packages/ ./packages/

# Copy web package config
COPY web/package.json web/package-lock.json* ./web/

# Install all workspace dependencies
RUN npm install

# Copy web source
COPY web/ ./web/

# Copy shared package source (may be needed for build if not pre-built)
COPY packages/ ./packages/

# Build-time API URL — points to the backend service in docker-compose
ARG NEXT_PUBLIC_API_URL=http://localhost:8001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js app
RUN npm run build --workspace=web

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=web"]
