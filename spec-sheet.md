# 🏗️ Technical Specification: Industrial Intelligence Engine (v1.0)

**Project Goal:** To build a privacy-first, B2B intent tracking system that deanonymizes website traffic for industrial clients in South Africa.

**Core Stack:** Next.js (Frontend), FastAPI (Backend), PostgreSQL (Database), Vanilla JS (Tracker).

---

## 1. System Architecture Overview

The system follows a **Decoupled Monolith** architecture. The Tracker runs on the client's site, the Backend handles logic/storage, and the Frontend handles presentation/sales.

### 1.1 The Three Pillars

1. **The Edge (Tracker):** A lightweight (<1KB) JS file hosted on a CDN.
2. **The Core (API):** A high-performance Python/FastAPI server.
3. **The Interface (Web):** A React/Next.js dashboard for clients and admins.

---

## 2. Component Specifications

### 2.1 The Tracker (Edge Layer)

* **Language:** Vanilla JavaScript (ES6+).
* **Delivery:** Minified via Cloudflare CDN.
* **Functionality:**
* **Initialization:** Captures `referrer`, `screen_res`, and `timestamp` on load.
* **Transport:** Uses `fetch` (keepalive) for Entry and `navigator.sendBeacon` for Exit.
* **Performance:** Must be non-blocking (`async`/`defer`).
* **Payload Limit:** < 2KB to ensure delivery over poor 3G/LTE networks in industrial zones.



### 2.2 The Backend (Logic Layer)

* **Framework:** FastAPI (Python 3.10+).
* **Concurrency:** `async`/`await` for all I/O operations (DB writes, API calls).
* **Key Services:**
* **Ingestion Service:** Handles high-volume `POST` requests from the tracker.
* **Enrichment Service:** Integrating **IPinfo** to resolve `IP` → `Company Name`.
* **Filtering Service:** Logic to discard consumer ISPs (Telkom, Vodacom, Rain, Afrihost).
* **Reporting Service:** Cron job (Celery/Arq) to generate PDF reports weekly.


* **Security:**
* **CORS:** Strict allow-list for registered client domains only.
* **Rate Limiting:** 100 req/min per IP to prevent abuse.



### 2.3 The Database (Persistence Layer)

* **Engine:** PostgreSQL (via Neon or Supabase).
* **ORM:** SQLModel (Pydantic + SQLAlchemy).

| Table | Purpose | Key Fields |
| --- | --- | --- |
| **Clients** | Stores your customer data | `id` (UUID), `company_name`, `domain`, `api_key`, `status` |
| **Visits** | The "Session" container | `id`, `client_id`, `ip_address`, `visitor_company`, `is_b2b` (bool) |
| **PageViews** | Specific actions/paths | `id`, `visit_id`, `url`, `duration_seconds`, `timestamp` |
| **Leads** | Sales funnel data | `id`, `email`, `traffic_vol`, `aov`, `status` (Qualified/Rejected) |

---

## 3. API Contract (Key Endpoints)

### Public Tracking API

* `POST /v1/track/entry`
* **Input:** `{client_id, url, referrer, screen_res}`
* **Process:** Check Redis cache for IP → If new, call IPinfo → Create `Visit` record.
* **Response:** `200 OK` (Processed in background).


* `POST /v1/track/exit`
* **Input:** `{client_id, url, duration, event_type="exit"}`
* **Process:** Update `PageView` entry with final `duration`.



### Internal Dashboard API

* `GET /v1/admin/clients`: List all clients & subscription status.
* `GET /v1/admin/stats`: Global traffic vs. leads generated.
* `POST /v1/admin/onboard`: Create new client + Generate unique Script Tag.

---

## 4. Frontend Specifications (Next.js)

### 4.1 The Marketing Site

* **Lead Funnel:**
* **Form A:** Contact details with Zod validation.
* **Form B:** Conditional logic (e.g., `Traffic > 1000` ? Qualify : Reject).



### 4.2 The Client Dashboard

* **Auth:** NextAuth.js (Magic Link or Email/Password).
* **Views:**
* **Overview:** Graph of Visits vs. Identified Leads.
* **Live Feed:** Real-time list of companies currently on site.
* **Settings:** Tracking snippet management.



---

## 5. Implementation Roadmap

### **Phase 1: The Foundation (Week 1)**

* [ ] **Day 1:** Setup Monorepo (Next.js + FastAPI). Configure Postgres DB.
* [ ] **Day 2:** Build Database Models (SQLModel) and Migrations.
* [ ] **Day 3:** Build `POST /entry` and `POST /exit` endpoints (Mock data).
* [ ] **Day 4:** Write `tracker.js` script and host locally for testing.
* [ ] **Day 5:** **Integration Test:** Ensure script successfully writes to DB.

### **Phase 2: The Intelligence (Week 2)**

* [ ] **Day 1:** Integrate **IPinfo API** and build "ISP Filter" logic.
* [ ] **Day 2:** Build the Lead Qualification Funnel (Frontend Form A/B).
* [ ] **Day 3:** Build Admin Dashboard (Basic Lead Table).
* [ ] **Day 4:** Deploy Backend (Railway/Render) and Frontend (Vercel).
* [ ] **Day 5:** **Live Test:** Test tracker on your own site via different networks.

### **Phase 3: The Business Logic (Week 3)**

* [ ] **Day 1:** Setup Cron Jobs for weekly reporting.
* [ ] **Day 2:** Design PDF Report template (HTML/CSS to PDF).
* [ ] **Day 3:** Integrate Email API (Resend/SendGrid) for report delivery.
* [ ] **Day 4:** Integrate Payment Gateway (Paystack) webhooks.
* [ ] **Day 5:** Final Polish, Security Audit (CORS, ENV vars).

---

## 6. Infrastructure & Costs (MVP)

| Service | Purpose | Plan | Est. Cost |
| --- | --- | --- | --- |
| **Vercel** | Frontend Hosting | Hobby | Free |
| **Railway/Render** | Backend Hosting | Hobby/Starter | ~$5/mo (R90) |
| **Neon** | Serverless Postgres | Free Tier | Free |
| **Cloudflare** | DNS & CDN | Free | Free |
| **IPinfo** | IP Enrichment | Free (50k reqs) | Free |
| **Resend** | Email | Free | Free |
| **Total** |  |  | **~R90 / month** |

---

