FROM node:18-alpine

LABEL org.opencontainers.image.title="DockerFlex Frontend"
LABEL org.opencontainers.image.description="Frontend for DockerFlex - The missing file manager for Docker containers"
LABEL org.opencontainers.image.source="https://github.com/mbakgun/dockerflex"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

ENV NODE_ENV=development
ENV VITE_DEV_SERVER_HOST=0.0.0.0
ENV VITE_DEV_SERVER_PORT=3000

CMD ["npm", "start"] 