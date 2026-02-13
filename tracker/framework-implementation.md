# 🚀 Framework Implementation Guide

⚠️ Proprietary Software Notice: This repository is private. Unauthorized copying, distribution, or use of any file within this repository is strictly prohibited.

This guide ensures the **Industrial Intelligence Tracker** is correctly initialized across various JavaScript ecosystems while maintaining high Core Web Vitals (LCP/FID).

## 1. Next.js (13+ App Router)

Next.js provides a dedicated `<Script />` component that optimizes loading strategies automatically.

**Location:** `app/layout.tsx` (Root Layout)

```tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://cdn.yourdomain.com/tracker.min.js"
          data-id="YOUR_CLIENT_ID"
          strategy="afterInteractive" 
        />
      </body>
    </html>
  )
}

```

* **Strategy:** `afterInteractive` is recommended so the tracker doesn't compete with the main site content for bandwidth.

---

## 2. React (Vite / Create React App)

In a standard React SPA, the script should be placed in the main entry HTML file to ensure it loads once per session.

**Location:** `public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <script 
      src="https://cdn.yourdomain.com/tracker.min.js" 
      data-id="YOUR_CLIENT_ID" 
      async>
    </script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>

```

---

## 3. Angular

Angular developers should inject the script into the `index.html`, but if they want to manage it via the Angular lifecycle, they can add it to the `assets` array or the `scripts` array in `angular.json`.

**Recommended Method:** `src/index.html`

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Client Site</title>
  <base href="/">
  <script 
    src="https://cdn.yourdomain.com/tracker.min.js" 
    data-id="YOUR_CLIENT_ID" 
    async>
  </script>
</head>
<body>
  <app-root></app-root>
</body>
</html>

```

---

## 4. Vue.js (Nuxt)

Nuxt.js manages the head through the `nuxt.config.ts` file. This is the cleanest way to ensure the script is injected globally.

**Location:** `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          src: 'https://cdn.yourdomain.com/tracker.min.js',
          'data-id': 'YOUR_CLIENT_ID',
          async: true
        }
      ]
    }
  }
})

```

---

## 5. Svelte / SvelteKit

In SvelteKit, use the `app.html` file to place the script globally.

**Location:** `src/app.html`

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		%sveltekit.head%
		<script 
            src="https://cdn.yourdomain.com/tracker.min.js" 
            data-id="YOUR_CLIENT_ID" 
            async>
        </script>
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>

```

---

Here is the updated documentation section formatted in **Markdown** for your technical docs or README.

---

## ⚠️ Important Implementation Notes

### 🔄 Single Page Application (SPA) & Soft Routing

The **Industrial Intelligence Tracker (v2)** is fully compatible with modern Single Page Applications (SPAs) built on frameworks like **Next.js, React, Vue, and Angular**.

Unlike standard tracking scripts that only fire on a full page load, this script utilizes **Monkey Patching** on the browser's History API. It automatically detects internal "Soft Navigations" by listening to `pushState`, `replaceState`, and `popstate` events.

* **Session Continuity:** When a user navigates internally (e.g., from `/home` to `/pricing`), the script automatically triggers an **Exit Ping** for the previous route and an **Entry Ping** for the new route without requiring a page refresh.
* **Accurate Duration:** Time-on-page calculations are reset and recorded per internal route, providing granular data on which specific sections of an SPA are capturing the most B2B interest.

---

### 🛡️ Content Security Policy (CSP)

If your client has a strict security policy, they must whitelist your domain to allow the script to load and the data to be transmitted. They will need to add the following to their CSP headers:

`script-src https://cdn.yourdomain.com; connect-src https://api.yourdomain.com;`


## ⚖️ License & Proprietary Notice

**Copyright (c) 2026 AuraWorks Pty (ltd). All Rights Reserved.**

This tracker script is proprietary software. Unauthorized copying, modification, or redistribution is strictly prohibited. Use is granted only to active subscribers of the Industrial Intelligence Engine managed service.

---
