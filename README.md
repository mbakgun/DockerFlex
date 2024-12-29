<div align="center">
  <img src="assets/logo.webp" alt="DockerFlex Logo" width="600"/>
  
  
  > The missing file manager for Docker containers
  
  *Manage Docker container files with elegance - your containers, your control*

  [![Docker Pulls](https://img.shields.io/docker/pulls/mbakgun/dockerflex-backend.svg?label=docker%20pulls)](https://hub.docker.com/r/mbakgun/dockerflex-backend)
  [![GitHub License](https://img.shields.io/github/license/mbakgun/dockerflex)](https://github.com/mbakgun/dockerflex/blob/master/LICENSE)
  [![GitHub Stars](https://img.shields.io/github/stars/mbakgun/dockerflex?style=social)](https://github.com/mbakgun/dockerflex)

</div>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-development">Development</a> •
  <a href="#-contributing">Contributing</a>
</p>

<div align="left">
  <img src="assets/first.gif" alt="DockerFlex File Management" width="800"/>
</div>

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

> 💡 For a comprehensive list of features and capabilities, check out our detailed [Features Guide](features.md).

## 🛠 Development

To set up DockerFlex for local development, follow these steps:

### Prerequisites

- Docker and Docker Compose installed on your system
- Git installed for cloning the repository

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/mbakgun/dockerflex.git
cd dockerflex
```

2. Start the development environment using Docker Compose:
```bash
docker compose -f docker-compose-local.yml up
```

### Environment Configuration

The development environment uses `docker-compose-local.yml` which includes:

- Frontend container running on port 3200
- Backend container with Docker socket access
- Hot-reloading for both frontend and backend
- Shared volumes for local development

Key environment variables:

- Frontend:
  - `VITE_API_URL`: API endpoint path (/api)
  - `VITE_BACKEND_URL`: Backend service URL (http://backend:4200)

- Backend:
  - `MASTER_PASSWORD`: Authentication password (optional)

### Accessing the Application

- Frontend: http://localhost:3200

### Development Notes

- The frontend container mounts your local `./frontend` directory for live updates
- The backend container mounts your local `./backend` directory and Docker socket
- Both services are configured with hot-reload for a smooth development experience

---

<div align="left">
  <img src="assets/second.gif" alt="DockerFlex File Management" width="800"/>
</div>

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## ✍️ Version History

DockerFlex is currently at version v1.0.1. For detailed information about changes and improvements in each version, please see our [CHANGELOG](CHANGELOG.md).

Latest updates include drag & drop support for parent directory operations, improved file/folder rename functionality, and various bug fixes. See the changelog for complete details.

<div align="left">
  <img src="assets/third.gif" alt="DockerFlex File Management" width="800"/>
</div>

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