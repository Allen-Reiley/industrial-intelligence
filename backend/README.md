# 🏗️ Industrial Intelligence Engine (v1.0)

⚠️ Proprietary Software Notice: This repository is private. Unauthorized copying, distribution, or use of any file within this repository is strictly prohibited.

A high-performance B2B traffic deanonymization engine designed to identify juristic persons (companies) visiting industrial websites. Built with **FastAPI**, **Next.js**, and **SQLModel**.

## 🚀 Quick Start (Phase 1: Local Dev)

### 1. Prerequisites

* **OS:** Windows 10/11 with **WSL 2** (Ubuntu recommended).
* **Package Manager:** [uv](https://github.com/astral-sh/uv) installed in WSL.
* **Docker:** Docker Desktop with WSL 2 integration enabled.

### 2. Backend Setup

Navigate to the `/backend` directory:

```bash
# 1. Create and activate virtual environment
uv venv
source .venv/bin/activate

# 2. Install dependencies in one go
uv pip install fastapi uvicorn[standard] sqlmodel psycopg2-binary pydantic-settings python-multipart "python-jose[cryptography]" "passlib[bcrypt]" "dotenv"

or

uv add fastapi uvicorn[standard] sqlmodel psycopg2-binary pydantic-settings python-multipart "python-jose[cryptography]" "passlib[bcrypt]" "dotenv"

# 3. Generate requirements for Docker parity
uv pip freeze > requirements.txt

```

### 3. Database Setup (Docker)

In the project root, create a `docker-compose.yml` file to spin up your local PostgreSQL instance:

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    container_name: industrial_db
    restart: always
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: industrial_intelligence
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:

```

**Run the database:**

```bash
docker compose up -d

```

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
| --- | --- |
| **Frontend** | Next.js 14+ (App Router), Tailwind CSS |
| **Backend** | FastAPI, Python 3.11+ |
| **Database** | PostgreSQL (Docker locally, Neon in Prod) |
| **ORM** | SQLModel (Pydantic + SQLAlchemy) |
| **Tracking** | Minified Vanilla JS (Beacon API) |

---

## 📂 Project Structure

```text
industrial-intelligence/
├── backend/                # FastAPI logic
│   ├── app/
│   │   ├── api/            # Route handlers (/entry, /exit)
│   │   ├── models/         # SQLModel schemas
│   │   └── core/           # Config & Enrichment logic
│   └── main.py             # Entry point
├── frontend/               # Next.js Dashboard & Lead Funnel
├── tracker/                # Vanilla JS script (tracker.min.js)
└── docker-compose.yml      # Local infrastructure

```

---

## 📑 API Endpoints (Planned)

* `POST /v1/track/entry` - Initialize session & identify company.
* `POST /v1/track/exit` - Update session duration.
* `GET /v1/admin/leads` - View qualified traffic (Internal).

---

## 🛡️ Compliance

This project is designed with **POPIA** (Protection of Personal Information Act) in mind, focusing on **Juristic Person** identification and strictly purging non-essential data.

---

## ⚖️ License & Proprietary Notice

**Copyright (c) 2026 AuraWorks Pty (ltd). All Rights Reserved.**

This tracker script is proprietary software. Unauthorized copying, modification, or redistribution is strictly prohibited. Use is granted only to active subscribers of the Industrial Intelligence Engine managed service.

---
