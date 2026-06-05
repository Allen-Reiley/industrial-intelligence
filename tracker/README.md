# 🛰️ AuraWorks Industrial Tracker — Client Implementation Guide

> [!WARNING]
> **Proprietary Software Notice:** This repository and its contents are private. Unauthorized copying, distribution, or use of any file within this repository is strictly prohibited. All rights reserved.

The **AuraWorks Industrial Tracker** is a lightweight, remote-controlled, timezone-aware B2B telemetry and consent management utility. By embedding a single asynchronous script tag, client sites can automatically track high-intent B2B visits, respect user privacy under POPIA and GDPR, and capture warm leads.

---

## 🏗️ Architecture & Remote Lifecycle

The tracker runs as a decoupled Vanilla JavaScript asset hosted on a globally distributed CDN. Instead of hardcoding behavior on the client's site, the script checks the visitor's context and coordinates with the AuraWorks API to determine what features and UI components to activate:

```mermaid
sequenceDiagram
    participant Browser as Client Browser
    participant CDN as AuraWorks CDN
    participant API as AuraWorks Backend
    participant DB as PostgreSQL Database
    
    Browser->>CDN: Fetch tracker script (aura.js)
    CDN-->>Browser: Return minified script
    Note over Browser: Extract Client ID & Browser Timezone
    Browser->>API: GET /v1/clients/config?client_id={ID}&tz={Timezone}
    Note over API: Verify Origin/Referer Header & Geolocation Policy
    API->>DB: Query client configuration & domains
    DB-->>API: Return client policy
    API-->>Browser: Return tracking parameters & consent mode
    alt GDPR Mode (EU Timezone)
        Browser->>Browser: Lock tracking; Inject Shadow DOM Banner immediately
    else POPIA Mode (SADC Timezone)
        Browser->>API: POST /v1/track/entry (Quiet B2B Telemetry)
        Browser->>Browser: Inject Layered Consent UI on scroll/interaction
    else Default Mode
        Browser->>API: POST /v1/track/entry (Standard Ingestion)
    end
```

---

## 🚀 Client Integration Script

To install the tracker, clients must insert the following asynchronous script tag immediately before the closing `</head>` tag on all web pages:

```html
<!-- AuraWorks Industrial Intelligence Ingestion Tag -->
<script 
  src="https://cdn.auraworks.co.za/aura.js" 
  data-id="YOUR_CLIENT_ID" 
  async 
  defer>
</script>
```

---

## 🔒 Security & Strict Domain Verification

To prevent unauthorized parties from copying a client's script tag and running it on malicious or unapproved domains, the AuraWorks backend enforces **Strict Domain Verification**:

1. **Origin / Referer Headers**: Every request made by the script to the backend configuration and tracking endpoints is validated. The backend parses the incoming `Origin` and `Referer` headers.
2. **Exact Domain Matches Only**: The requesting domain must match the client's registered primary domain or whitelist.
3. **Staging & Subdomains**: Validation is strictly literal. Subdomains and staging environments (e.g., `staging.yourdomain.com`, `test.yourdomain.com`) are blocked by default. **Clients must register every staging and subdomain URL** in their AuraWorks Portal to allow tracking in those environments.
4. **Failure Behavior**: If verification fails, the backend returns an `HTTP 403 Forbidden` response, and the script halts execution silently to prevent script overhead.

---

## ⚖️ Timezone-Based Compliance Routing

The tracker utilizes lightweight client-side timezone checks to determine legal compliance paths without incurring third-party IP geolocation lookups on every page load:

* **Timezone Extraction**: The script reads the browser's native timezone using `Intl.DateTimeFormat().resolvedOptions().timeZone`.
* **Config Matching**: The timezone string (e.g. `Europe/Berlin`, `Africa/Johannesburg`) is sent to the backend config API via the query string: `/v1/clients/config?client_id={id}&tz={timezone}`.
* **Compliance Modes**:
  * **GDPR Mode (EU timezones starting with `Europe/` or matching EU states)**: Explicit opt-in required. All fingerprinting, WebGLGPU unmasking, and page tracking are strictly blocked until the user clicks "Accept" on the consent banner.
  * **POPIA Mode (SADC timezones starting with `Africa/` or matching SADC states)**: Legitimate juristic (B2B) firmographic tracking starts silently on load. Personal identifiers (names, emails, clock drifts) are masked and held in a 48-hour conditional buffer, which is cleared by the Janitor unless explicit opt-in consent is acquired.
  * **Default Mode (Other timezones)**: Standard business tracking and default banner triggers.

---

## 🎨 Encapsulated Consent Banner & Shadow DOM

To ensure visual consistency and protect the banner from style contamination by the host website, the tracker isolates all HTML and CSS using the **Shadow DOM**:

* **Style Isolation**: By wrapping the UI container using `container.attachShadow({mode: 'closed'})`, the parent page's CSS rules (e.g., Tailwind, Bootstrap, or global overrides) are blocked from affecting the banner.
* **Closed Mode**: Prevents external scripts on the host site from reading or manipulating the consent forms, adding an extra layer of data security.

### The 4 Interactive Capture Phases
Depending on client config and user interaction, the script coordinates the following phases:
1. **Phase 01 (Initial Slide-in)**: A subtle bottom-right notification pops up after a 2.5-second initial delay, prompting the user for an enterprise email.
2. **Phase 02 (Dwell Scroll Ceiling)**: If the visitor crosses a **50% scrolling ceiling** on technical specification sheets or tables, the banner expands into a multi-column contact capture grid (acquiring Role, Name, and Phone).
3. **Phase 03 (Exit Intent)**: Captures upward mouse acceleration vectors and triggers a popup offering custom parameter calculators or spec downloads.
4. **Phase 04 (Asset Gate)**: Gates PDF blueprint, CAD model, or datasheet downloads, requesting business email validation before delivering files.

---

## 💾 Offline Robustness (`AuraOfflineQueue`)

SADC mining districts and industrial zones often suffer from cellular network drops. To prevent telemetry losses, the script integrates `AuraOfflineQueue` built on browser-level **IndexedDB**:

* **Automatic Cache**: If a network request fails (`navigator.onLine = false` or fetch times out), the tracker caches the telemetry logs locally in the browser's IndexedDB.
* **Retry Loop**: The script listens to the browser's online event. Once connection recovery is validated, the queue flushes the backlogged events to the `/v1/track` endpoints using recursive exponential backoff loops.

---

## 🛠️ Build & Minification Pipeline

Before deploying the script to Cloudflare R2 or an AWS S3 CDN bucket, it must be minified to respect the `<1KB` size budget:

```bash
# 1. Install Terser build dependencies
npm install

# 2. Run the minification script (Uses Terser to optimize and output to dist/tracker.min.js)
npm run build
```

---

**Copyright (c) 2026 AuraWorks (Pty) Ltd. All Rights Reserved.**
