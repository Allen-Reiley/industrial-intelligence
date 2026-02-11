# 🛠️ Infrastructure & Orchestration

⚠️ Proprietary Software Notice: This repository is private. Unauthorized copying, distribution, or use of any file within this repository is strictly prohibited.

This directory contains the configuration files required to provision, containerize, and orchestrate the Industrial Intelligence Engine's services. It ensures that the environment is identical across **Local Development**, **Staging**, and **Production**.

## 📦 Containerization Strategy

We use **Docker** to encapsulate our backend and database logic. This prevents "dependency drift" and ensures that South African regional network configurations (like specific MTU settings for certain ISPs) can be tested consistently.

### 1. The Backend Image (`backend.Dockerfile`)

* **Base:** `python:3.11-slim`
* **Optimization:** Multi-stage builds to keep the final image size small.
* **Process:** Handles FastAPI, Uvicorn, and system-level dependencies for PDF generation.

### 2. The Database Service

* **Image:** `postgres:15-alpine`
* **Persistence:** Named volumes are used to ensure data survives container restarts.

---

## 🏗️ Orchestration (Docker Compose)

The `docker-compose.yml` file in the root coordinates the following services:

| Service | Port | Purpose |
| --- | --- | --- |
| **api** | `8000` | The FastAPI Backend (Core Logic). |
| **db** | `5432` | PostgreSQL instance for local data storage. |
| **redis** | `6379` | (Optional/Planned) For caching IPinfo lookups. |

---

## 🚀 Usage

### Local Development

To spin up the entire local infrastructure:

```bash
docker compose up -d

```

### Checking Logs

To monitor the backend and database output:

```bash
docker compose logs -f

```

### Tearing Down

To stop services and remove containers (preserving data volumes):

```bash
docker compose down

```

---

## 🌐 Production Deployment (Railway/Render)

While local dev uses Docker Compose, production deployment relies on the `Dockerfile` located in this directory (or the backend root).

* **CI/CD:** Pushing to the `main` branch triggers an automatic build.
* **Health Checks:** The infrastructure is configured to monitor the `/health` endpoint of the FastAPI app before routing traffic.

---

## 🔒 Security & Environment

All sensitive credentials (DB passwords, API keys for IPinfo) are injected via a `.env` file which is **never** committed to version control. Refer to `.env.example` for the required keys.

---

## ⚖️ License & Proprietary Notice

**Copyright (c) 2026 AuraWorks Pty (ltd). All Rights Reserved.**

This tracker script is proprietary software. Unauthorized copying, modification, or redistribution is strictly prohibited. Use is granted only to active subscribers of the Industrial Intelligence Engine managed service.

---
