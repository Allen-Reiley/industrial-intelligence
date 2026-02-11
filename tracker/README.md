# 🛰️ Industrial Intelligence Tracker

⚠️ Proprietary Software Notice: This repository is private. Unauthorized copying, distribution, or use of any file within this repository is strictly prohibited.

A high-performance, non-blocking JavaScript utility designed to capture B2B visitor intent. This script is the "Edge" component of the Industrial Intelligence Engine.

## 🛠️ Technical Specifications

* **Size:** ~600 bytes (Minified & Gzipped).
* **Delivery:** Async/Defer via Cloudflare CDN.
* **Compatibility:** IE11+, Chrome, Firefox, Safari, Edge (uses `sendBeacon` with `fetch` fallback).
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
│   └── index.js      # Source tracking logic (Human readable)
├── dist/             # Production-ready minified files
│   └── tracker.min.js
├── package.json      # Build scripts (Terser/UglifyJS)
└── README.md         # This documentation

```

---

## 📡 Data Payload

The script captures two distinct events to maximize data accuracy:

### 1. The Entry Event (Page Load)

Fires immediately to ensure the company is identified even if the user bounces.

* `client_id`: Unique identifier for the client.
* `url`: The exact page being viewed.
* `referrer`: The source of the traffic (e.g., Google, LinkedIn).
* `screen_resolution`: Used for fingerprinting/bot detection.

### 2. The Exit Event (Page Close/Hide)

Fired via `navigator.sendBeacon` when the user leaves the tab.

* `duration`: Total active seconds spent on the page.
* `event_type`: "exit".

---

## 🏗️ Build Instructions

If you modify the source logic in `src/index.js`, you must rebuild the minified version:

```bash
# Install build tools (Terser)
npm install

# Run the minification script
npm run build

```

---

## ⚖️ License & Proprietary Notice

**Copyright (c) 2026 AuraWorks Pty (ltd). All Rights Reserved.**

This tracker script is proprietary software. Unauthorized copying, modification, or redistribution is strictly prohibited. Use is granted only to active subscribers of the Industrial Intelligence Engine managed service.

---

