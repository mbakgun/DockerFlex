FROM node:18-alpine

LABEL org.opencontainers.image.title="DockerFlex Backend"
LABEL org.opencontainers.image.description="Backend API for DockerFlex - The missing file manager for Docker containers"
LABEL org.opencontainers.image.source="https://github.com/mbakgun/dockerflex"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

EXPOSE 4000

# Create volume mount point
VOLUME ["/app/node_modules"]

CMD ["npm", "start"] 