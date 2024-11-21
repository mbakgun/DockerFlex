FROM node:18-alpine

LABEL org.opencontainers.image.title="DockerFlex Frontend"
LABEL org.opencontainers.image.description="Frontend for DockerFlex - The missing file manager for Docker containers"
LABEL org.opencontainers.image.source="https://github.com/mbakgun/dockerflex"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Initialize npm project if package.json doesn't exist
RUN if [ ! -f package.json ]; then npm init -y; fi

# Install global dependencies
RUN npm install -g vite@latest @vitejs/plugin-react

EXPOSE 3000

ENV NODE_ENV=development
ENV VITE_DEV_SERVER_HOST=0.0.0.0
ENV VITE_DEV_SERVER_PORT=3000

CMD ["sh", "-c", "npm install && npm run dev"] 