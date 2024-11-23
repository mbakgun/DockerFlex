<div align="center">
  <img src="assets/logo.webp" alt="DockerFlex Logo" width="600"/>
  
  # DockerFlex
  
  > The missing file manager for Docker containers
  
  *Manage Docker container files with elegance - your containers, your control*

  [![Frontend Docker Pulls](https://img.shields.io/docker/pulls/mbakgun/dockerflex-frontend.svg?label=frontend%20pulls)](https://hub.docker.com/r/mbakgun/dockerflex-frontend)
  [![Backend Docker Pulls](https://img.shields.io/docker/pulls/mbakgun/dockerflex-backend.svg?label=backend%20pulls)](https://hub.docker.com/r/mbakgun/dockerflex-backend)
  [![GitHub License](https://img.shields.io/github/license/mbakgun/dockerflex)](https://github.com/mbakgun/dockerflex/blob/master/LICENSE)
  [![GitHub Stars](https://img.shields.io/github/stars/mbakgun/dockerflex?style=social)](https://github.com/mbakgun/dockerflex)

</div>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-development">Development</a> •
  <a href="#-contributing">Contributing</a>
</p>

## 🚀 Overview

DockerFlex is a modern web-based application that simplifies Docker container file management. Whether you're a developer, DevOps engineer, or system administrator, DockerFlex provides an intuitive interface for managing container files without the complexity of traditional tools.

<br>

<div align="center">
  <img src="assets/overview.svg" alt="DockerFlex Overview" width="800"/>
</div>

## ✨ Key Features

- 🔍 **Container Overview**
  - View all Docker containers and their status
  - Quick access to container details
  - Real-time status updates

- 📁 **File Management**
  - Browse container files with an intuitive interface
  - Upload files and folders with drag-and-drop
  - Download files and directories
  - Edit files directly in the browser
  - Delete files and folders
  - Create new files and directories

- 🛠 **Developer Experience**
  - Clean, modern interface
  - Fast and responsive
  - Cross-platform compatibility
  - No installation required (web-based)
 
<div>
  <img src="assets/first.gif" alt="Development" width="720"/>
</div>

## 🚀 Installation

### Quick Start

1. Run with a single command:
   ```bash
   curl -O https://raw.githubusercontent.com/mbakgun/dockerflex/master/docker-compose.yml
   docker compose up -d
   ```

2. Access DockerFlex:
   - Web Interface: [http://localhost:3200](http://localhost:3200)

### Configuration Options

1. Environment Variables:

   | Variable | Description | Default |
   |----------|-------------|---------|
   | VITE_HOSTNAME | Custom hostname display | Docker Desktop |
   | VITE_API_URL | Backend API endpoint path | /api |
   | VITE_BACKEND_URL | Internal backend URL | http://backend:4200 |

2. Example Configurations:

   Basic setup (docker-compose.yml):
   ```yaml
   services:
     frontend:
       image: mbakgun/dockerflex-frontend:latest
       hostname: dockerflex-frontend
       container_name: dockerflex-frontend
       restart: unless-stopped
       ports:
         - "3200:3200"
       environment:
         - VITE_API_URL=/api
         - VITE_BACKEND_URL=http://backend:4200
       networks:
         - app-network
   
     backend:
       image: mbakgun/dockerflex-backend:latest
       hostname: dockerflex-backend
       container_name: dockerflex-backend
       restart: unless-stopped
       expose:
         - "4200"
       volumes:
         - /var/run/docker.sock:/var/run/docker.sock
       networks:
   ```

   Custom settings (example):
   ```yaml
   services:
     frontend:
       image: mbakgun/dockerflex-frontend:latest
       restart: unless-stopped
       environment:
         - VITE_HOSTNAME=Production Server    # Custom hostname
         - VITE_API_URL=/api                  # API path prefix
         - VITE_BACKEND_URL=http://backend:4200  # Internal backend URL
       ports:
         - "3200:3200"
   ```

### Network Configuration

1. Local Development:
   - Default setup works out of the box
   - Frontend and backend communicate via Docker network
   - Only port 3200 needs to be exposed externally

2. Internal Network:
   - No additional configuration needed
   - Backend is only accessible via Docker network
   - Frontend proxies all API requests to backend

3. Remote Access:
   - Only port 3200 needs to be exposed
   - Backend port (4200) is internal only
   - All API requests are automatically proxied through frontend

### Troubleshooting

Common issues and solutions:
- If hostname isn't updating, ensure VITE_HOSTNAME is properly set in your environment
- For API connection issues, verify the containers are on the same network
- Container access requires proper Docker socket mounting
- Make sure port 3200 is accessible from your network

## 🔧 Development

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mbakgun/dockerflex.git
   cd dockerflex
   ```

2. Start local development:
   ```bash
   # Stop any running instances
   docker compose down
   
   # Build and start with local changes
   docker compose -f docker-compose-local.yml up --build
   ```

3. Development features:
   - Hot reload for frontend
   - Auto-restart for backend
   - Volume mounts for local development
   - Local changes reflected immediately

### Debugging

View logs:
```bash
# All services
docker compose logs

# Specific service
docker compose logs frontend
docker compose logs backend
```

<div>
  <img src="assets/second.gif" alt="Development" width="720"/>
</div>

## 🔒 Security Considerations

- Implement authentication before production use
- Restrict Docker socket access
- Set appropriate file upload limits
- Enable HTTPS in production
- Validate file operations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 💬 Support

- GitHub Issues: Report bugs and feature requests
- Documentation: Check inline code comments
- Contact: Reach me through GitHub

## 💰 Donations

If you find DockerFlex helpful, consider supporting its development through cryptocurrency donations:

<details>
<summary>🪙 Cryptocurrency Wallets</summary>

| Coin | Network | Wallet Address |
|------|---------|----------------|
| USDT | ERC20   | `0x093bA9f00a2cdaAC9d70b625644b592BD3C96AF2` |
| DASH | DASH    | `Xh6VgfeTasdQEdErouoYbWWqZbQR9nLZen` |
| SOL  | SOL     | `DF67UJ4QzVNVGKKWyEeA88hBCL54L1aMbadG794UrNp8` |

<div align="center">
  <sub>All donations go towards maintaining and improving DockerFlex</sub>
</div>
</details>

## 🎉 Acknowledgments

Special thanks to all contributors who have helped make DockerFlex better!

---

<div align="center">
  <sub>Built with ❤️ for the Docker community</sub>
</div>

<br>
