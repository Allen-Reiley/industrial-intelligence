# 🎨 Next.js Web Portal (Developer Guide)

> [!WARNING]
> **Proprietary Software Notice:** This repository is private. Unauthorized copying, distribution, or use of any file within this repository is strictly prohibited. All rights reserved.

This is the developer setup and deployment guide for the **Industrial Intelligence Web Portal**, built using **Next.js 14+ (App Router)** and **TypeScript**.

---

## ⚡ Development Setup

### 1. Prerequisites
* **Node.js:** v18.17.0 or higher (v20+ recommended).
* **Package Manager:** `npm` (configured with package-lock.json).

### 2. Install Dependencies
Navigate to the `frontend/src` directory and install the required modules:
```bash
cd frontend/src
npm install
```

### 3. Environment Variables Setup
Create a `.env.local` file in `frontend/src` containing the local backend details:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/v1
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 4. Run the Development Server
```bash
npm run dev
```
* The portal will be available at **[http://localhost:3000](http://localhost:3000)**.
* Open the browser and visit `/apply` to test the qualifying form flow or `/dashboard` to inspect the client dashboard.

---

## 🏗️ Build & Production Deployment

### 1. Production Build
Verify typescript types and generate the highly optimized nextjs production build locally:
```bash
npm run build
```

### 2. Local Preview
Run the production build locally to test server-side rendering (SSR) and edge capabilities:
```bash
npm run start
```

### 3. Deploying to Vercel
This repository is configured for direct **Vercel** integration. 
* **CI/CD:** Pushing to the `main` branch automatically triggers a production deployment.
* **Env Config:** Ensure you add `NEXT_PUBLIC_API_URL` (pointing to your live Render/Railway backend) in the Vercel dashboard variables.

---

## 🛠️ Interface Technology Stack

* **Core Framework:** Next.js 14+ (App Router, React Server Components).
* **Styling:** Tailwind CSS, PostCSS, and customized CSS variables matching the "Quiet Premium" design tokens.
* **Component Library:** **Shadcn/UI** (primitives built on Radix UI and Tailwind CSS).
* **Form Logic & Validation:** React Hook Form + **Zod** schema validations.
* **Auth Layer:** NextAuth.js (Magic Link authentication for zero-friction client login).
* **State Management:** Custom React context hooks paired with SWR for high-speed cache revalidation.

---

## 🔒 Security Best Practices

* **Sensitive Data Gating:** Never expose client API keys or PII inside client-side bundles. Always leverage Next.js Server Components or custom backend API proxies for sensitive reads.
* **CORS Policies:** Make sure the backend CORS configuration permits the specific Vercel deployment URL.

---

## ⚖️ License

**Copyright (c) 2026 AuraWorks Pty (ltd). All Rights Reserved.**
Unauthorized copying, modification, or redistribution of this software is strictly prohibited.
