FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps \
 && npm i -D vite @vitejs/plugin-react typescript --legacy-peer-deps \
 && npm i bootstrap@5.3.8 \
 && npm i react-bootstrap bootstrap \
 && npm i react-hot-toast
COPY frontend /app
RUN npm run build

FROM nginx:alpine
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
