FROM node:18-alpine

LABEL org.opencontainers.image.title="DockerFlex Backend"
LABEL org.opencontainers.image.description="Backend API for DockerFlex - The missing file manager for Docker containers"
LABEL org.opencontainers.image.source="https://github.com/mbakgun/dockerflex"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Initialize npm project if package.json doesn't exist
RUN if [ ! -f package.json ]; then npm init -y; fi

EXPOSE 4000

CMD ["npm", "start"] 