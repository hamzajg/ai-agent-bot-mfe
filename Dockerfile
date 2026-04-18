# === Stage 1: Build the React app ===
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Build both the widget (default) and the SPA (landing/admin) into dist/app
# - `build` will produce the widget bundle as configured in vite.config.ts
# - `build:spa` will produce the classic app build into dist/app
RUN npm run build:all

# === Stage 2: Serve with lightweight web server ===
FROM nginx:stable-alpine
WORKDIR /tmp
# Copy the built artifacts from the builder stage into a temp location
# SPA output is now in /app/dist (root), widget lib is in /app/dist/widget
COPY --from=builder /app/dist /tmp/site
COPY --from=builder /app/dist/widget /tmp/widget
# Merge both outputs into the nginx web root so the landing SPA and widget are served
RUN mkdir -p /usr/share/nginx/html \
  && cp -a /tmp/site/. /usr/share/nginx/html/ || true \
  && cp -a /tmp/widget/. /usr/share/nginx/html/ || true \
  && rm -rf /tmp/site /tmp/widget

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
