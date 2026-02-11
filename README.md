# 🏭 Industrial Intelligence Engine (Master)

⚠️ Proprietary Software Notice: This repository is private. Unauthorized copying, distribution, or use of any file within this repository is strictly prohibited.

The **Industrial Intelligence Engine** is a specialized B2B intent-tracking SaaS. It deanonymizes website traffic for industrial firms in the East Rand (and beyond), turning anonymous IP addresses into actionable sales leads.


## 📂 Project Structure

```text
industrial-intelligence/
├── backend/       # FastAPI + SQLModel + PostgreSQL (The Core)
├── frontend/      # Next.js 14 + Tailwind (The Interface & Lead Funnel)
├── tracker/       # Vanilla JS (The Edge Script)
└── infra/         # Docker, Nginx, or CI/CD configs

```

---

## ⚡ Quick Start (Development Mode)

### 1. Clone & Environment

Ensure you are using **WSL 2** and have **Docker Desktop** running.

```bash
git clone https://github.com/Allen-Reiley/industrial-intelligence.git
cd industrial-intelligence

```

### 2. Infrastructure (Postgres)

Spin up the local database using Docker:

```bash
docker compose up -d

```

### 3. Backend Setup (FastAPI)

Using `uv` for high-speed dependency management:

```bash
cd backend
uv venv
source .venv/bin/activate
uvicorn main:app --reload

```

### 4. Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev

```

---

## 🛰️ How it Works (The Data Loop)

1. **Capture:** The `tracker.min.js` fires on a client's site.
2. **Identify:** The Backend receives the IP, queries **IPinfo**, and filters out residential ISPs.
3. **Store:** Valid B2B visits are saved to **PostgreSQL**.
4. **Report:** The Client Dashboard visualizes the traffic, and a weekly PDF is generated for the client's sales team.

---

## 🛠️ Tech Stack Summary

* **Backend:** FastAPI, Python 3.11, SQLModel, Uvicorn.
* **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/UI.
* **Database:** PostgreSQL (Neon.tech for Production).
* **Deployment:** Vercel (Frontend) + Render (Backend) + Cloudflare (CDN).

---

## 🛡️ Business Logic & Compliance

* **Targeting:** Specifically engineered for the Industrial/Manufacturing sector.
* **Pricing:** R10,000/month managed service.
* **Privacy:** Designed for POPIA compliance—identifying Juristic Persons (Companies), not natural individuals.

---

## 📅 Roadmap (Phase 1)

* [x] Technical Specification & Architecture.
* [x] WSL 2 & Docker Environment Setup.
* [ ] Database Schema Design (SQLModel).
* [ ] API Ingestion Endpoints (`/entry`, `/exit`).
* [ ] Lead Qualification Funnel build.

---

## ⚖️ License & Proprietary Notice

**Copyright (c) 2026 AuraWorks Pty (ltd). All Rights Reserved.**

This tracker script is proprietary software. Unauthorized copying, modification, or redistribution is strictly prohibited. Use is granted only to active subscribers of the Industrial Intelligence Engine managed service.

---
