# AuraWorks Next.js Frontend Integration & UI Overhaul Log (Phase 16)

This log details the execution, design decisions, and completed steps for Phase 16, which bridges the decoupled edge tracking architecture with the top-of-funnel VSL strategy.

## 1. Edge Tracker Integration (Public Layout)
- **File Modified**: `frontend/src/app/layout.jsx`
- **Actions Taken**:
  - Removed old imports and usage of React-based `AuraTracker` and `AuraConsentBanner` components.
  - Injected the new CDN-hosted edge tracker script within the `<head>` of the layout:
    ```html
    <script src="https://cdn.auraworks.co.za/aura.js" data-client-id="c4a6c9b1-8355-4de2-985d-a04f4dcd63a0" defer></script>
    ```
  - Removed double-loading risks by completely eliminating legacy internal consent banner components.

## 2. Global VSL CTA Migration
- **Files Modified**:
  - `frontend/src/components/cta/call-to-action.tsx`
  - `frontend/src/components/header/header.tsx`
  - `frontend/src/components/hero-sec/hero-section.tsx`
  - `frontend/src/components/pricing/pricing.tsx`
  - `frontend/src/components/sections/about/about-cta.tsx`
  - `frontend/src/components/sections/features/features-cta.tsx`
  - `frontend/src/components/sections/solutions/solutions-cta.tsx`
- **Actions Taken**:
  - Located all action-trigger buttons/links that read "Book a Call", "Get Demo", or "Join Waitlist".
  - Renamed the copy to **"Watch Video"**.
  - Updated their routes using Next.js `<Link>` components to point directly to `/vsl`.

## 3. VSL Page Aesthetic Overhaul
- **File Modified**: `frontend/src/components/vsl/vsl-funnel.tsx`
- **Actions Taken**:
  - Updated the VSL landing page to correctly inherit the public light mode styling:
    - Replaced `bg-zinc-950` with `bg-background` (which maps to pure white in `globals.css`).
    - Replaced `text-zinc-100` and `text-zinc-400` with standard `text-foreground` and `text-muted-foreground` classes.
    - Updated background ambient blur glow shapes to use subtle light-mode matching `bg-zinc-100/50` and `bg-zinc-50`.
    - Made the video container card frame clean (`bg-zinc-50/50` with `border-border` and a soft shadow).
    - Remodeled the "Go Back" button hover background states to use a light `hover:bg-zinc-100` state.
    - Realigned the delayed CTA reveal button to use `bg-zinc-900 hover:bg-zinc-800 text-white` classes.
  - Verified that the distraction-free nature of the layout remains intact (no global header or footer on `/vsl`).
  - Verified that the Framer Motion-based delay reveal animation and warm abandonment telemetry hooks (10-second timer) remain fully functional.

## 4. Theme Partitioning & Public UI Dark Class Stripping
- **Files Modified**:
  - `frontend/src/components/sections/features/feature-grid.tsx`
  - `frontend/src/components/sections/features/identity-bridge.tsx`
  - `frontend/src/components/sections/solutions/compliance-bridge.tsx`
  - `frontend/src/components/sections/solutions/vertical-stacks.tsx`
  - Landing, hero, navigation, footers, content sections, and about CTAs.
- **Actions Taken**:
  - Fully stripped `dark:` utility classes from all public components to guarantee they render exclusively in the crisp, light "Quiet Premium" design.
  - Verified that the admin and dashboard pages (`/admin`, `/dashboard`) retain their original deep dark mode styling capabilities as they employ custom hardcoded dark-color utilities (e.g. `bg-[#070708]`, `bg-[#09090b]`, `bg-[#0c0c0e]`) which do not depend on `.dark` wrapper class toggles.

## 5. Google OAuth Callback Routing Audit & Host Remediation
- **Audit Findings**:
  - The FastAPI-Users Google OAuth router is mounted inside `backend/app/api/v1/auth.py` via `fastapi_users_instance.get_oauth_router` with prefix `/google`.
  - The auth router is loaded in `backend/app/main.py` under the prefix `/api/v1/auth`.
  - The exact callback path string expected by the backend is `/api/v1/auth/google/callback`.
  - **Local Development Callback URI**: `http://localhost:8000/api/v1/auth/google/callback`
  - **Production Callback URI**: `https://api.auraworks.co.za/api/v1/auth/google/callback`
- **Actions Taken**:
  - Refactored `backend/app/core/config.py` to support dynamic environment setting `OAUTH_REDIRECT_URI`.
  - Updated `backend/app/api/v1/auth.py` to supply `redirect_url=settings.OAUTH_REDIRECT_URI` to `get_oauth_router`, preventing scheme/host mismatches behind reverse proxies.
  - Added default `OAUTH_REDIRECT_URI` to `backend/.env` for local development.
  - Verified that all unit tests continue to pass.

## 6. Edge Tracker Event Telemetry 500 & CORS Remediation
- **Diagnostic Findings**:
  - **CORS Configuration**: Verified `ALLOWED_ORIGINS` in `backend/app/core/config.py` correctly allows `https://auraworks.co.za` and `https://www.auraworks.co.za`. Unhandled exceptions in the endpoint bypassed CORS headers, surfacing as a browser CORS failure.
  - **Database UUID/String Comparison Error (500)**: In `/v1/track/event` (`backend/app/api/v1/track.py`), when the `aura_id` was `None` or not initialized, the system fell back to `payload.client_id` (a `UUID` object). Running `select(Visit).where(Visit.aura_id == target_aura_id)` with a UUID object raised a SQL syntax error: `operator does not exist: character varying = uuid`, resulting in a 500 error.
  - **Schema Validation Error (422)**: The client-side `aura.js` dispatches consent telemetry events via `/v1/track/event` without the optional `url` parameter. Since `url: str` was a required field in `PageViewCreate`, the endpoint rejected these payloads.
- **Actions Taken**:
  - Modified `PageViewCreate` in `backend/app/models/visit.py` to make the `url` field optional (`url: Optional[str] = None`).
  - Wrapped the fallback `payload.client_id` in `str()` inside `track_event` route in `backend/app/api/v1/track.py` to coerce it to a string, preventing database comparison failures.
  - Added the `test_track_event_without_url_and_null_aura_id` integration test simulating the bad payload, verifying it resolves and returns `200 OK`.
  - Verified all 78 backend tests and 24 frontend tests pass successfully.

## 7. ASGI Proxy Headers & Scheme Override Middleware
- **Diagnostic Findings**:
  - The production deployment experienced proxy header stripping (likely by reverse proxy/load balancers), resulting in FastAPI generating oauth redirect URIs with `http://localhost:8000` (since it fell back to internal ASGI server parameters).
- **Actions Taken**:
  - Refactored `backend/app/core/config.py` to add `ENVIRONMENT` and `API_DOMAIN` configurations.
  - Injected `ProxyHeadersMiddleware` from `uvicorn.middleware.proxy_headers` into `backend/app/main.py`.
  - Implemented an ASGI/HTTP middleware `override_proxy_headers` in `backend/app/main.py` that intercepts requests in production, forces `request.scope["scheme"] = "https"`, and overrides the server/host details using the configured `API_DOMAIN`.
  - Verified that all 78 backend tests continue to compile and pass successfully.

## 8. Hardened Global Exception Handling & Endpoint Safety Guard
- **Diagnostic Findings**:
  - Unhandled errors (like database connection issues or syntax exceptions) during execution bypassed the standard Starlette CORS middleware response pipeline, stripping headers and masking the true errors in the browser console.
- **Actions Taken**:
  - Registered custom global exception handlers for `Exception` and `SQLAlchemyError` using `@app.exception_handler()` in `backend/app/main.py`. These handlers log full tracebacks to the server log and return `JSONResponse` objects with explicitly injected CORS headers for allowed origins (allowing `https://www.auraworks.co.za`).
  - Wrapped database operations in `/v1/track/event` (`backend/app/api/v1/track.py`) in a `try...except` block catching `IntegrityError` to safely capture and return `400 Bad Request` ("Invalid or missing client_id") instead of crashing the process.
  - Verified all 78 backend tests continue to compile and pass successfully.
