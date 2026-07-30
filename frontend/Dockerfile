# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# API requests go to /api (proxied by Nginx to the unified backend).
# Portfolio/blog/notes/admin use VITE_API_URL; option analyzer uses VITE_OPTION_API_URL;
# resume defaults to /api when VITE_RESUME_API_URL is unset.
ARG VITE_API_URL=/api/v1/
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_OPTION_API_URL=/api/v1/option
ENV VITE_OPTION_API_URL=$VITE_OPTION_API_URL

RUN npm run build

# Serve stage
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
