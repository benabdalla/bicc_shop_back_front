# ============= BUILD STAGE =============
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build -- --configuration production

# ============= RUNTIME STAGE =============
FROM nginx:stable-alpine
COPY --from=build /app/dist/shop-sense /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
