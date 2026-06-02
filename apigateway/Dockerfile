# Build from ROOT context: docker-compose sets context: .
FROM node:20-alpine

WORKDIR /app

# Install dependencies from root package.json
COPY package*.json ./
RUN npm ci --omit=dev

# Copy gateway source
COPY apigateway/ ./apigateway/

# Copy resume for download endpoint
COPY resume/ ./resume/

WORKDIR /app/apigateway

EXPOSE 3000

CMD ["node", "server.mjs"]
