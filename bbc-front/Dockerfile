# Stage 1: Build Angular app
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production 

# Stage 2: Serve Angular with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/shop-sense /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
