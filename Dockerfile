# Dockerfile

# === STAGE 1: BUILD STAGE (Para instalar dependencias) ===
# Utilizamos una imagen de Node.js ligera como base para construir.
FROM node:20-slim AS builder

# Establece el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copia los archivos de definición de dependencias.
COPY package*.json ./

# Instala todas las dependencias.
RUN npm install

# Copia el resto del código fuente.
COPY . .

# === STAGE 2: PRODUCTION STAGE (La imagen final, más limpia) ===
# Utilizamos una imagen Node.js más pequeña y segura para la ejecución final.
FROM node:20-alpine

# Establece el directorio de trabajo.
WORKDIR /app

# Copia SOLAMENTE las dependencias y el código necesario desde el 'builder'
# Esto hace que la imagen final sea mucho más pequeña (mejor para producción).
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/index.js .
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/services ./services
COPY --from=builder /app/models ./models
#COPY --from=builder /app/middlewares ./middlewares
COPY --from=builder /app/public ./public
# Asegúrate de copiar cualquier otro archivo crucial (e.g., config, utilidades)

# La API corre en el puerto 3000 (basado en tu código index.js)
EXPOSE 3000

# Define la variable de entorno para la configuración de DB
# ESTO SERÁ SOBREESCRITO POR docker-compose
ENV DB_HOST=db

# Comando para iniciar la aplicación cuando el contenedor arranque.
CMD ["npm", "start"]