FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias incluyendo devDependencies para desarrollo
RUN npm ci

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3001

# Comando para desarrollo con hot reload
CMD ["npm", "run", "dev"]