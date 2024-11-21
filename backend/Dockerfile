FROM node:18-alpine

LABEL org.opencontainers.image.title="DockerFlex Backend"
LABEL org.opencontainers.image.description="Backend API for DockerFlex - The missing file manager for Docker containers"
LABEL org.opencontainers.image.source="https://github.com/mbakgun/dockerflex"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["node", "src/index.js"] 