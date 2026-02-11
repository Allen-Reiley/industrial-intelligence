# 🎨 Industrial Intelligence Frontend

⚠️ Proprietary Software Notice: This repository is private. Unauthorized copying, distribution, or use of any file within this repository is strictly prohibited.

The user-facing side of the Industrial Intelligence Engine. This repository contains the marketing site, the high-friction lead qualification funnel, and the client-facing reporting dashboard.

## 🚀 Getting Started

### 1. Prerequisites

* **Node.js:** v18.17 or later.
* **Package Manager:** `npm` or `pnpm`.

### 2. Installation

Navigate to the `/frontend` directory:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

```

The site will be available at `http://localhost:3000`.

---

## 🏗️ Features & Logic

### 1. The Lead Funnel (`/apply`)

A two-stage qualification process designed to filter for high-value industrial clients:

* **Stage 1:** Basic contact collection (Name, Company, Email).
* **Stage 2:** Metric-based qualification (Monthly Traffic, Average Order Value, Closing Rate).
* **Logic:** If the prospect meets the threshold, they are redirected to a **Zoom/Teams** booking page; otherwise, they receive a "Value-Add" rejection message.

### 2. Client Dashboard (`/dashboard`)

* **Live Feed:** Real-time visibility into which companies are currently browsing the client's site.
* **Lead Analytics:** Breakdown of "Hot Leads" (high duration/high intent) vs. general traffic.
* **Integration Hub:** Provides the client with their unique `tracker.min.js` snippet.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router).
* **Styling:** [Tailwind CSS](https://tailwindcss.com/).
* **Components:** [Shadcn/UI](https://ui.shadcn.com/) + [Lucide React](https://lucide.dev/) icons.
* **Form Handling:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for strict validation.
* **State/Data Fetching:** [TanStack Query](https://tanstack.com/query/latest) (React Query).

---

## 📂 Directory Structure

```text
frontend/
├── src/
│   ├── app/                # Next.js App Router (Pages)
│   │   ├── apply/          # The Lead Funnel logic
│   │   ├── dashboard/      # Client reporting UI
│   │   └── api/            # Next.js Route Handlers (Internal)
│   ├── components/         # Reusable UI components (Buttons, Inputs, etc.)
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utils (API clients, formatting)
├── public/                 # Static assets (Logos, Icons)
└── tailwind.config.ts      # Theme configuration

```

---

## 🌐 Deployment

This frontend is optimized for deployment on **Vercel**.

* Environment variables required:
* `NEXT_PUBLIC_API_URL`: The URL of your FastAPI backend.
* `NEXTAUTH_SECRET`: For dashboard authentication security.



---

