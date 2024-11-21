FROM node:18-alpine

LABEL org.opencontainers.image.title="DockerFlex Frontend"
LABEL org.opencontainers.image.description="Frontend for DockerFlex - The missing file manager for Docker containers"
LABEL org.opencontainers.image.source="https://github.com/mbakgun/dockerflex"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with clean npm cache
RUN npm cache clean --force && \
    npm install --legacy-peer-deps && \
    npm install -g vite@latest @vitejs/plugin-react

# Copy the rest of the application
COPY . .

EXPOSE 3000

ENV NODE_ENV=development
ENV VITE_DEV_SERVER_HOST=0.0.0.0
ENV VITE_DEV_SERVER_PORT=3000

# Create volume mount points
VOLUME ["/app/node_modules", "/app/.vite"]

# Use npx to ensure we're using the local vite installation
CMD ["sh", "-c", "npm install && npm run dev"] 