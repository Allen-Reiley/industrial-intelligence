# 🛰️ Industrial Intelligence Tracker

> ⚠️ **Proprietary Software Notice:** This repository is private. Unauthorized copying, distribution, or use of any file within this repository is strictly prohibited.

A high-performance, non-blocking JavaScript utility designed to capture B2B visitor intent. This script is the "Edge" component of the Industrial Intelligence Engine.

## 🛠️ Technical Specifications

* **Size:** ~600 bytes (Minified & Gzipped).
* **Delivery:** Async/Defer via Cloudflare CDN.
* **Compatibility:** IE11+, Chrome, Firefox, Safari, Edge (uses `sendBeacon` with `fetch` fallback).
* **SPA Ready:** Supports Next.js, React, Vue, and Angular via History API interception.
* **Privacy:** Strictly captures metadata for Juristic Person (Company) identification. No PII (Personally Identifiable Information) is stored in the browser.

---

## 🚀 Deployment for Clients

To integrate the tracker, provide the following snippet to the client to be placed before the closing `</head>` tag:

```html
<script 
  src="https://cdn.yourdomain.com/tracker.min.js" 
  data-id="CLIENT_UNIQUE_ID" 
  async>
</script>

```

---

## 📂 Internal Structure

```text
tracker/
├── src/
│   └── index.js      # Source tracking logic (Human readable / SPA-aware)
├── dist/             # Production-ready minified files
│   └── tracker.min.js
├── package.json      # Build scripts (Terser/UglifyJS)
└── README.md         # This documentation

```

---

## 🔄 SPA & Soft Routing

The tracker is designed for modern web apps. It automatically detects internal navigation by "monkey-patching" the browser's History API (`pushState` and `replaceState`).

* **Session Continuity:** Triggers an **Exit Ping** for the current route and an **Entry Ping** for the new route without a page refresh.
* **Accurate Duration:** Resets timers per internal route for granular behavior tracking.

---

## 📡 Data Payload

The script captures two distinct events to maximize data accuracy:

### 1. The Entry Event (Page Load / Route Change)

* `client_id`: Unique identifier for the client.
* `url`: The exact page being viewed.
* `referrer`: Traffic source (Google, LinkedIn, etc.).
* `screen_resolution`: Used for fingerprinting/bot detection.

### 2. The Exit Event (Page Close / Internal Nav)

* `duration`: Total active seconds spent on the specific URL.
* `event_type`: "exit".

---

## 🏗️ Build Instructions

You must compile the human-readable source into the production-ready minified version before deploying to the CDN.

```bash
# 1. Install build tools (Terser) - Only needed once
npm install

# 2. Run the minification script 
# This takes src/index.js and outputs to dist/tracker.min.js
npm run build

```

---

## 🛡️ Content Security Policy (CSP)

If a client has a strict CSP, they must whitelist your domains:
`script-src https://cdn.yourdomain.com; connect-src https://api.yourdomain.com;`

---

## ⚖️ License & Proprietary Notice

**Copyright (c) 2026 AuraWorks Pty (ltd). All Rights Reserved.**

This tracker script is proprietary software. Unauthorized copying, modification, or redistribution is strictly prohibited. Use is granted only to active subscribers of the Industrial Intelligence Engine managed service.
