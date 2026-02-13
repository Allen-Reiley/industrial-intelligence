# 🛠️ CMS & Tag Manager Implementation

⚠️ Proprietary Software Notice: This repository is private. Unauthorized copying, distribution, or use of any file within this repository is strictly prohibited.

This guide covers platforms where users typically have access to a "Custom HTML" or "Header" settings panel rather than the raw source code.

## 1. WordPress (Standard)

There are two primary ways to do this in WordPress.

### Option A: Using a Plugin (Recommended for non-devs)

1. Install the **"Insert Headers and Footers"** (or "WPCode") plugin.
2. Navigate to **Code Snippets > Header & Footer**.
3. Paste the script into the **Header** section.
4. Click **Save**.

### Option B: Theme Editor

1. Go to **Appearance > Theme File Editor**.
2. Locate `header.php` on the right-hand sidebar.
3. Paste the script just before the closing `</head>` tag.
4. Click **Update File**.

---

## 2. Google Tag Manager (GTM)

Many B2B companies prefer GTM because it allows their marketing team to manage scripts without touching the code again.

1. Log in to **Google Tag Manager** and select your Container.
2. Click **Tags > New**.
3. **Tag Configuration:** Choose **Custom HTML**.
4. Paste your script tag exactly as provided.
5. **Triggering:** Select **All Pages** (Window Loaded or Page View).
6. Click **Save** and **Submit/Publish** the changes.

---

## 3. Shopify

1. Go to **Online Store > Themes**.
2. Click the **three dots (...)** next to your active theme and select **Edit Code**.
3. Open the `theme.liquid` file.
4. Locate the `<head>` tag and paste your script directly below it.
5. Click **Save**.

---

## 4. Wix

1. Go to your Wix Dashboard.
2. Navigate to **Settings > Custom Code** (under the Advanced section).
3. Click **+ Add Custom Code** at the top right.
4. Paste the script tag in the text box.
5. **Name:** "Industrial Intelligence Tracker".
6. **Add Code to Pages:** Select **All Pages** and **Load code on each new page**.
7. **Place Code in:** Select **Head**.
8. Click **Apply**.

---

## 5. Webflow

1. Open your **Project Settings**.
2. Go to the **Custom Code** tab.
3. Paste the script into the **Head Code** section.
4. Click **Save Changes** and **Publish** your site.

---

## 🔍 Post-Implementation Verification

Once the client has installed the script, you can verify it from your side:

1. **Check the Network Tab:** Open the client's site, press `F12`, and go to the **Network** tab. Filter by "tracker". You should see `tracker.min.js` loading with a `200 OK` status.
2. **Check the Console:** Ensure there are no CORS errors (this means your FastAPI backend is rejecting their domain).
3. **Live Ping:** Look at your database (or your `/admin` dashboard) to see if a new visit from that `client_id` has appeared.

---

### **What's next?**

We have covered the docs for modern frameworks and traditional CMS platforms.

**Shall we start writing the actual logic for `tracker/src/index.js`?** I can write it in a way that handles both initial loads and SPA "soft" navigation (React/Next.js) so you only ever need one version of the script.


## ⚖️ License & Proprietary Notice

**Copyright (c) 2026 AuraWorks Pty (ltd). All Rights Reserved.**

This tracker script is proprietary software. Unauthorized copying, modification, or redistribution is strictly prohibited. Use is granted only to active subscribers of the Industrial Intelligence Engine managed service.

---
