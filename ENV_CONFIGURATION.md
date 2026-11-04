# AuraWorks Environment Configuration Guide

This file outlines the required and optional environment variables for deploying the **AuraHQ Dashboard** (`dash.auraworks.co.za`) on Vercel and the **FastAPI Backend** (`api.auraworks.co.za`) on Railway.

---

## 1. Dashboard Environment Variables (`dashboard/` on Vercel)

Configure these in the Vercel project dashboard under **Settings → Environment Variables**:

```ini
# --- FastApi Backend API Endpoint ---
NEXT_PUBLIC_API_URL=https://api.auraworks.co.za

# --- Better Auth Identity & Sessions ---
BETTER_AUTH_URL=https://dash.auraworks.co.za
BETTER_AUTH_SECRET=your-shared-better-auth-secret-min-32-chars
COOKIE_DOMAIN=.auraworks.co.za

# --- PostgreSQL Connection String (Node.js standard format) ---
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# --- Client Analytics (PostHog) ---
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_AkVXnxZvKweeKXbnpriK4EbGYvP2A4dD6dU7cJvxTuKj
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# --- ImageKit (Optional Avatar / Media CDN) ---
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/auraworks
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_your_key_here

# --- Social OAuth Providers (Optional) ---
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
# MICROSOFT_CLIENT_ID=
# MICROSOFT_CLIENT_SECRET=
```

---

## 2. Backend Environment Variables (`backend/` on Railway)

Configure these in Railway under the FastAPI service **Variables**:

```ini
# --- Application Mode ---
ENVIRONMENT=production
PROJECT_NAME="AuraWorks Industrial Intelligence OS"
VERSION=3.2.1
API_V1_STR=/api/v1
API_DOMAIN=api.auraworks.co.za

# --- Security & Authentication ---
ADMIN_API_KEY=your-production-admin-api-key-min-32-chars
SECRET_KEY=your-production-backend-secret-key-min-32-chars
BETTER_AUTH_SECRET=your-shared-better-auth-secret-min-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=11520
COOKIE_DOMAIN=.auraworks.co.za

# --- Database & Cache ---
# Note: FastAPI SQLModel requires the asyncpg driver prefix
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname?ssl=require
REDIS_URL=redis://default:password@host:6379

# --- Visitor Enrichment & Intelligence ---
IPINFO_TOKEN=your_ipinfo_token
APOLLO_API_KEY=your_apollo_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# --- External Sync Sinks ---
AIRTABLE_BASE_ID=app...
AIRTABLE_API_KEY=pat...
AIRTABLE_TABLE_NAME=Forensic_Leads
NOTION_DATABASE_ID=...
NOTION_TOKEN=secret_...

# --- Notification Webhooks (Slack) ---
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_VISIT_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_COMPLIANCE_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_SUPPORT_WEBHOOK_URL=https://hooks.slack.com/services/...

# --- Email Engine (Resend) ---
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=AuraWorks <onboarding@auraworks.co.za>
RESEND_WEBHOOK_SECRET=whsec_...
CALENDLY_LINK=https://calendly.com/auraworks/demo
CALENDLY_WEBHOOK_SECRET=

# --- Payment Integrations ---
IKHOKHA_API_URL=https://api.ikhokha.com
IKHOKHA_CLIENT_ID=
IKHOKHA_CLIENT_SECRET=
IKHOKHA_WEBHOOK_SECRET=
PAYGENIUS_WEBHOOK_SECRET=

# --- Media Processing (ImageKit) ---
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/auraworks
```

---

## 3. Critical Synchronization Requirements

1. **`BETTER_AUTH_SECRET`**:
   Must be identical on both Vercel (`dashboard`) and Railway (`backend`) so session tokens and signed cookies can be decrypted and validated across services.
2. **`DATABASE_URL`**:
   - Vercel (`dashboard`): Standard PostgreSQL URI (`postgresql://...`).
   - Railway (`backend`): Asyncpg PostgreSQL URI (`postgresql+asyncpg://...`).
3. **`COOKIE_DOMAIN`**:
   Set to `.auraworks.co.za` on both services to ensure that session cookies are shared across `dash.auraworks.co.za`, `auraworks.co.za`, and `api.auraworks.co.za`.
