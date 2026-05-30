# 🏗️ Core Engine (FastAPI Backend)

> [!WARNING]
> **Proprietary Software Notice:** This repository is private. Unauthorized copying, distribution, or use of any file within this repository is strictly prohibited. All rights reserved.

The **Core Intelligence Engine** is a high-throughput, async FastAPI backend that ingests traffic pings, executes deterministic B2B identification, gates residential ISP traffic, and coordinates automated reporting.

---

## 📂 Directory Structure

```text
backend/
├── app/
│   ├── api/            # API Route handlers (versioned v1)
│   │   └── v1/
│   │       ├── track.py      # Main ingestion endpoints (/entry, /exit)
│   │       ├── clients.py    # Admin management routes
│   │       └── leads.py      # Lead analytics aggregation
│   ├── core/           # Configuration, security, and credentials
│   │   ├── config.py         # System settings (Pydantic-settings)
│   │   └── security.py       # AES-256 field-level encryption logic
│   ├── models/         # Database models (SQLModel)
│   │   ├── client.py         # Customer account schemas
│   │   ├── visit.py          # Session-level logs & firmographic flags
│   │   └── pageview.py       # Granular route visit & duration data
│   ├── services/       # Core business logic
│   │   ├── enrichment.py     # IPinfo API & ISP range filters
│   │   ├── contacts.py       # Department-level contact lookup
│   │   └── reports.py        # PDF Weekly report generator
│   ├── db.py           # Database sessions (Neon Postgres engine)
│   └── main.py         # FastAPI application entry point
├── async_migrations/   # Alembic migration scripts
├── pyproject.toml      # Dependency declaration
└── requirements.txt    # Frozen dependencies for Docker sync parity
```

---

## ⚡ Setup & Local Development

### 1. Prerequisites
Ensure you are using **WSL 2** with Python 3.12+ and have `uv` installed.

### 2. Activate Virtual Environment & Sync Packages
```bash
# Navigate to the backend directory
cd backend

# Create virtual environment if it doesn't exist
uv venv

# Activate the virtual environment
source .venv/bin/activate

# Install and sync dependencies from lockfile
uv sync
```

### 3. Spin Up Local DB
Ensure your root `docker-compose.yml` database container is active:
```bash
docker compose up -d
```

### 4. Run Migrations (Alembic)
Ensure all schema upgrades are executed before starting the API:
```bash
uv run alembic upgrade head
```

### 5. Launch FastAPI Development Server
```bash
uv run uvicorn app.main:app --reload
```
* **API Portal:** [http://localhost:8000](http://localhost:8000)
* **OpenAPI Specs:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc Docs:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🔒 Security Architecture & RLS

### Field-Level Encryption (AES-256)
To ensure POPIA and GDPR compliance, sensitive Personally Identifiable Information (PII) is encrypted at-rest before being written to PostgreSQL.
* **Encrypted Fields:** `visitor_email`, `phone_number`, `precise_location` (GPS coordinates).
* **Unencrypted Fields:** `visitor_company`, `industry`, `domain` (firmographic data kept raw for lightning-fast indices and search aggregation).

### Multi-Tenancy (Row-Level Security)
Row-Level Security (RLS) is enforced at the database engine level. Every queries includes a strict `client_id` context check, completely preventing any cross-pollination of client traffic audits.

### Forensic ISP Filter
The backend checks every inbound IP against a strict range index, automatically weeding out non-B2B residential and cellular traffic:
* **Blacklisted ISPs:** Vodacom, MTN, Telkom, Rain, Afrihost.
* **B2B Qualification:** Fixed-line corporate CIDR ranges only.

---

## 📡 API Contract (Version 1)

### Ingestion Protocol
* **`POST /v1/track/entry`**
  * Ingests the initial visitor fingerprint and metadata.
  * Calls enrichment routines in the background to prevent client-side latency.
* **`POST /v1/track/exit`**
  * Receives duration and page interaction stats via browser beacons on exit.

### Admin & Analytics Protocol
* **`GET /v1/admin/clients`** - Read/Update subscriber accounts.
* **`GET /v1/admin/leads`** - Aggregated analytics table for the corporate dashboards.
* **`POST /v1/admin/onboard`** - Provision new customer accounts and generate tracking snippets.

---

## ⚖️ License

**Copyright (c) 2026 AuraWorks Pty (ltd). All Rights Reserved.**
Unauthorized copying, modification, or redistribution of this software is strictly prohibited.
