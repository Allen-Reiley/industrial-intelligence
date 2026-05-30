# 🛰️ Forensic Edge Script (Industrial Tracker)

> [!WARNING]
> **Proprietary Software Notice:** This repository is private. Unauthorized copying, distribution, or use of any file within this repository is strictly prohibited. All rights reserved.

The **Forensic Edge Script** (`aura.js`) is an ultra-high performance, non-blocking B2B intent tracking utility. Hosted via a globally distributed CDN, it resides on client sites, executing advanced browser unmasking and human-behavioral gating before routing pings to the API Core.

---

## 🛠️ Technical Specifications

* **Footprint:** `<1KB` (Minified & Gzipped) ensuring immediate execution even on low-bandwidth 3G/LTE networks in industrial areas.
* **Delivery:** Async & deferred loading; completely non-blocking to protect Core Web Vitals (LCP, FID, INP).
* **Compatibility:** Universal ES6 engine support with secure fallback routes (`navigator.sendBeacon` for exit events, with an asynchronous `fetch` fallback).
* **Multi-Route Awareness:** Native monkey-patching of the HTML5 History API (`pushState`, `replaceState`, `popstate`) to record Single Page Application (SPA) soft-navigation seamlessly.

---

## 🔒 Forensic Unmasking & Bot Defense

To deliver the high-fidelity B2B target resolution, the tracker integrates several advanced behavioral gating and fingerprinting mechanisms:

### 1. Triple-Redundancy Persistence
To survive privacy-clearing utilities and browser cache wipes, visitor identifiers are cached across three persistent layers in parallel:
* **First-Party HTTP Cookies**
* **HTML5 LocalStorage**
* **IndexedDB Object Stores**

### 2. Behavioral Dwell Gating
To protect server resources and prevent scrapers from polluting the intelligence dataset, enrichment requests are gated:
* **2-Second Dwell Threshold:** Tracking events only fire after 2 seconds of active, human-verified dwell time.
* **Human Verification:** Captures active keyboard input, mouse scroll velocity, and erratic cursor trajectory indexes to classify humans vs. bots.

### 3. Honeypot Bot Traps
The script listens to hidden links and mock tags commonly scraped by automated procurement scripts, instantly blacklisting and dropping pings from scraper agents.

### 4. Partial Lead Harvesting
Monitors the `blur` events on input form fields. If a corporate prospect types their email into an industrial form and leaves without clicking submit, the script securely harvests the email to avoid lost leads.

---

## 📂 Directory Structure

```text
tracker/
├── src/
│   └── index.js      # Human-readable ES6 tracking source
├── dist/             # Compiled production targets
│   └── tracker.min.js# Terser-minified, CDN-ready payload
├── package.json      # Terser build configurations
├── imbed.html        # Local test harness file
└── README.md         # Forensic guide (This document)
```

---

## 🚀 Client Integration Instructions

To integrate the tracker script, provide the client with the following code block to be inserted just before the closing `</head>` tag:

```html
<!-- AuraWorks Industrial Intelligence Tracker -->
<script 
  src="https://cdn.yourdomain.com/tracker.min.js" 
  data-id="CLIENT_UNIQUE_API_KEY" 
  async 
  defer>
</script>
```

---

## 🔄 SPA & Route Change Monitoring

The tracker automatically overrides the default browser history methods, providing deep routing visibility in SPAs (React, Next.js, Vue, Angular):
* **State Sync:** Triggers an immediate `exit` ping for the previous route and a `v1/track/entry` ping for the new route.
* **Duration Reset:** Resets active route dwell timers, providing granular data on which pricing pages or specifications receive the highest attention span.

---

## 📦 Build & Compilation Pipeline

Before uploading the tracking script to your CDN (Cloudflare/AWS S3), you must compress the source file using the Terser package pipeline:

```bash
# 1. Install Terser build dependencies (Done once)
npm install

# 2. Run the minification pipeline
npm run build
```
This strips comments, aggregates code branches, and outputs the highly compressed payload to `dist/tracker.min.js`.

---

## 🛡️ Content Security Policy (CSP)

Clients enforcing strict Content Security Policies must authorize your tracking subdomain. Provide them with the following directive:

```http
script-src https://cdn.yourdomain.com;
connect-src https://api.yourdomain.com;
```

---

## ⚖️ License

**Copyright (c) 2026 AuraWorks Pty (ltd). All Rights Reserved.**
Unauthorized copying, modification, or redistribution of this software is strictly prohibited. Use is granted solely to active subscribers of the Industrial Intelligence Engine.
