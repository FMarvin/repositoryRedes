FROM node:18-alpine as build

WORKDIR /app

# Copiamos package.json e instalamos dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código y construimos la app
COPY . .
RUN npm run build

# Etapa 2: Servidor Web (Producción)
FROM nginx:alpine

# Copiamos los archivos construidos (dist) a la carpeta de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración básica de Nginx para React (Manejo de rutas)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]