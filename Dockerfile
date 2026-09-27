# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Environment-specific configuration is injected at build time
ARG VITE_API_URL=/api
ARG VITE_USE_MOCK=false
ENV VITE_API_URL=$VITE_API_URL \
    VITE_USE_MOCK=$VITE_USE_MOCK
RUN npm run build

# ---- runtime stage ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
CMD ["nginx", "-g", "daemon off;"]
