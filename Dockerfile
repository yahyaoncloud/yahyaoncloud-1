# --- Stage 1: Build Remix Frontend ---
FROM node:20-alpine as remix-builder

WORKDIR /frontend

COPY app app
COPY public public
COPY remix.config.js package.json package-lock.json ./

RUN npm ci --omit=dev
RUN npm run build

# Remove node_modules and caches to keep size down
RUN rm -rf node_modules .cache

# --- Stage 2: Build Go Backend ---
FROM golang:1.22.4-alpine3.20 as go-builder

WORKDIR /backend

RUN apk --no-cache add ca-certificates

COPY go-backend go-backend
WORKDIR /backend/go-backend

RUN go build -o server main.go
RUN go clean -cache -modcache -i -r

# --- Final Stage: Runtime Container ---
FROM alpine:latest

WORKDIR /app

# Copy Go binary
COPY --from=go-builder /backend/go-backend/server ./server

# Copy Remix static output
COPY --from=remix-builder /frontend/public ./public
COPY --from=remix-builder /frontend/build ./build

# Set runtime env variables (optional)
ENV PORT=8080

EXPOSE 8080

CMD ["./server"]
