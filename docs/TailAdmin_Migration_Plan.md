# TailAdmin Dashboard Migration & Hardening Execution Plan (v2.0)

**Reference Source:** `frontend/os_dashboard_source` (TailAdmin Next.js Open Source Template)  
**Audit Findings Reference:** `docs/DASHBOARD_AUDIT_REPORT.md`  
**Architecture Map Reference:** `docs/OS_DASHBOARD_SOURCE_ARCHITECTURE.md`  
**Target Environments:** `frontend/src` (Next.js 16 App Router) & `backend/app` (FastAPI / PostgreSQL)  
**Standard:** 100% Test Coverage Gates • Zero Mock Data • Real RBAC • Complete Astryx Eradication

---

## Executive Directives

1. **Total Verbatim UI Transfer (with AuraWorks Customization):**  
   Replicate the layout, components, styling, typography, and interactive UX patterns from `frontend/os_dashboard_source` verbatim. Cleanly swap branding (AuraWorks logo) and remove irrelevant template features (Logistics demo, "Purchase Plan" widget, dev UI showcase menus).
2. **Absolute Eradication of Astryx Styling:**  
   No legacy Astryx CSS classes (`bg-emerald-500/10`, `divide-zinc-800`, `dark:bg-white/3`, custom SVG badges, juristic ledger styles) are permitted. All pages must use native TailAdmin design tokens and components (`ComponentCard`, `BasicTableOne`, `Badge`, `Button`, `Modal`).
3. **Zero Mock Data in Final Code:**  
   Every single interactive feature—Calendar events, Tasks, User Profile fields, Avatar upload via ImageKit, Link Generator, Admin Personnel directory, Permission toggles, and Metrics—must be wired to real PostgreSQL models and authenticated FastAPI endpoints.
4. **Bulletproof Security & RBAC:**  
   Eliminate all authentication backdoors. Public self-registration on `/login` is restricted. User provisioning is exclusive to the Admin Console. RBAC is enforced on the server/middleware (`proxy.ts` and FastAPI dependencies), never relying solely on client-side `useEffect` redirects.
5. **Strict Test-Driven Verification Gates:**  
   No phase may be marked complete without passing automated unit and integration tests (Vitest for frontend, Pytest for backend).

---

## Phase 0: Security Hardening & Backend API Foundation
**Goal:** Fix all critical backend vulnerabilities and establish the database schemas and endpoints required by the dashboard features before touching UI.

- [x] **Task 0.1: Remove Backend Security Backdoor (`security.py`)**
  - Locate `backend/app/core/security.py` lines 155–168 where raw user ID or email token matching is permitted.
  - Delete this fallback or strictly restrict it to test runners with an environment flag (`ENVIRONMENT == "testing"`). Ensure `get_current_user` validates cryptographic session tokens only.
- [x] **Task 0.2: Implement Admin User Creation Endpoint (`POST /api/v1/admin/users`)**
  - Implement `POST /api/v1/admin/users` in `backend/app/api/v1/admin.py`.
  - Accept `email`, `password`, `full_name`, `role` (`admin` | `sales`), `job_title`, and initial `permissions`.
  - Hash password securely using existing app hasher (`argon2` / `bcrypt`), persist `User` entity, and return created user.
- [x] **Task 0.3: Restrict Public Registration & Lock Down `/login` Flow**
  - In `frontend/src/lib/auth.ts`, disable public auto-approval or set newly self-registered accounts to `role: 'unassigned'`, `is_active: false`.
  - Update public `/login` to prioritize Admin-issued credentials.
- [x] **Task 0.4: Database Schema & Endpoints for Calendar Events**
  - Create SQLAlchemy model `CalendarEvent` (`id`, `title`, `start_time`, `end_time`, `all_day`, `category`, `user_id`, `created_at`, `updated_at`).
  - Create migration or model sync in `backend/app/models/calendar.py`.
  - Create FastAPI endpoints `/api/v1/calendar/events` (`GET`, `POST`, `PUT`, `DELETE`) with RBAC:
    - Admin: Full CRUD on all calendar events.
    - Sales Rep: Read all company events, but CRUD restricted to events where `user_id == current_user.id`.
- [x] **Task 0.5: Database Schema & Endpoints for Tasks**
  - Create SQLAlchemy model `Task` (`id`, `title`, `description`, `status`, `priority`, `due_date`, `assigned_to_id`, `created_by_id`, `created_at`, `updated_at`).
  - Create migration/model in `backend/app/models/task.py`.
  - Create FastAPI endpoints `/api/v1/tasks/` (`GET`, `POST`, `PATCH`, `DELETE`) with RBAC:
    - Admin: Global CRUD.
    - Sales Rep: View and manage tasks assigned to or created by them.
- [x] **Task 0.6: User Route Permissions Schema & Toggle Endpoint**
  - Add `permissions` (JSON / array column) to `User` model (`["analytics", "sales", "calendar", "tasks"]`).
  - Implement `PATCH /api/v1/admin/users/{user_id}/permissions` in `backend/app/api/v1/admin.py`.
- [x] **Task 0.7: ImageKit Authentication Endpoint**
  - Implement `GET /api/v1/auth/imagekit-auth` in `backend/app/api/v1/auth.py` to generate secure `token`, `expire`, and `signature` for client-side avatar uploads.

### Verification Gate (Phase 0)
- [x] Pytest suite: Verify `get_current_user` rejects raw email/ID strings without valid session tokens.
- [x] Pytest suite: Verify `POST /api/v1/admin/users` creates users and hashes passwords properly.
- [x] Pytest suite: Verify Calendar and Tasks CRUD endpoints enforce role boundaries.
- [x] Pytest suite: Verify ImageKit auth returns valid signature and expiration timestamp.

---

## Phase 1: Environment Preparation, CSS, & Server-Side Route Guarding
**Goal:** Prepare the Next.js environment, align Tailwind CSS v4 design tokens, and enforce server-side RBAC in Next.js middleware.

- [x] **Task 1.1: Design Tokens & CSS Merge**
  - Audit `frontend/src/app/globals.css` against `frontend/os_dashboard_source/src/app/globals.css`.
  - Ensure all Tailwind CSS v4 `@theme` design tokens (colors, fonts, box shadows, borders) are identical.
  - Purge any remaining Astryx color variables or legacy CSS rules.
- [x] **Task 1.2: Server-Side RBAC & Middleware Hardening (`proxy.ts`)**
  - Refactor `frontend/src/proxy.ts`:
    - Protect `/aurahq/*`: Redirect unauthenticated requests to `/login`.
    - Authenticated `/login` visits: Inspect user role from session token/cookie and redirect Admins to `/aurahq/admin` and Sales Reps to `/aurahq/sales`.
    - Role barrier on `/aurahq/admin`: Validate role server-side; redirect Sales Reps to `/aurahq/sales` before the page bundle or layout renders (preventing flash of unauthorized content).
- [x] **Task 1.3: Clean URL & Route Alignment**
  - Align root `/aurahq`: Redirect to `/aurahq/admin` for Admins and `/aurahq/sales` for Sales Reps.
  - Remove dead 404 routes (`/aurahq/error-404`, `/aurahq/signin`, `/aurahq/signup`).
  - Ensure clean dynamic routing without legacy broken paths.

### Verification Gate (Phase 1)
- [x] Vitest middleware test: Unauthenticated user accessing `/aurahq/admin` or `/aurahq/sales` redirects to `/login`.
- [x] Vitest middleware test: Authenticated Sales Rep accessing `/aurahq/admin` redirects to `/aurahq/sales`.
- [x] Next.js build: Run `npm run build` with zero errors.

---

## Phase 2: Layout, AppHeader, AppSidebar, & Branding Integration
**Goal:** Transplant the exact TailAdmin shell layout from `frontend/os_dashboard_source`, swap in AuraWorks branding, and fix top-level navigation defects.

- [x] **Task 2.1: AppSidebar Transplant & Branding**
  - Re-architect `frontend/src/layout/AppSidebar.tsx` using `frontend/os_dashboard_source/src/layout/AppSidebar.tsx` as the verbatim reference.
  - Replace TailAdmin logo with the official AuraWorks SVG logo (`/images/logo/auraworks-logo.svg`).
  - Remove "Logistics" menu entry and route.
  - Remove "Purchase Plan" widget (`SidebarWidget.tsx`).
  - Remove template component showcase items (`alerts`, `avatars`, `badge`, `buttons`, `images`, `videos`, `form-elements`, `basic-tables`) from production navigation.
  - Implement role-filtered navigation:
    - Admin: Admin Console, Sales Portal, Analytics, Calendar, Tasks, User Profile.
    - Sales Rep: Sales Portal, Analytics, Calendar, Tasks, User Profile.
- [x] **Task 2.2: AppHeader & UserDropdown Fix**
  - Re-architect `frontend/src/layout/AppHeader.tsx` and `frontend/src/components/header/UserDropdown.tsx` matching `frontend/os_dashboard_source`.
  - Fix User Identity: Dynamically populate user name, email, role, and avatar from `useSession()`.
  - Fix Profile Link: Change target to `/aurahq/profile` (resolving the previous 404 error).
  - Fix Sign Out: Replace dead `<Link href="/signin">` with an interactive button executing `authClient.signOut()` and redirecting to `/login`.
- [x] **Task 2.3: NotificationDropdown Cleanup**
  - Replace hardcoded dummy notifications in `NotificationDropdown.tsx` with real notification telemetry (or a clean, styled empty state).

### Verification Gate (Phase 2)
- [x] Vitest component test: `AppSidebar` renders correct role-scoped items for Admin vs. Sales Rep.
- [x] Vitest component test: `UserDropdown` displays active session profile and calls `signOut()` on click.
- [x] Visual verification: Mobile drawer collapse/expand and responsive backdrop work smoothly.

---

## Phase 3: Authentication Portal Modernization (`/login`)
**Goal:** Refactor `/login` to match TailAdmin's split-screen authentication UI while closing security gaps.

- [x] **Task 3.1: Split-Screen Auth Layout Alignment**
  - Model `/login` on `frontend/os_dashboard_source/src/app/[locale]/(full-width-pages)/(auth)/layout.tsx` and `components/auth/SignInForm.tsx`.
  - Display AuraWorks branding, dark/light theme switcher, and modern TailAdmin input styling.
- [x] **Task 3.2: Form Wiring & Interaction Polish**
  - Eliminate the public "Sign Up" toggle or replace it with a notice that accounts are provisioned by AuraWorks administrators.
  - Wire "Forgot password?" with a modern modal/toast notification.
  - Pass the "Keep me logged in" checkbox state to Better Auth `signIn.email()` options.
  - Replace native browser `alert()` popups with TailAdmin's native `Alert` component.
  - Integrate Microsoft OAuth button alongside Google and GitHub buttons.

### Verification Gate (Phase 3)
- [x] Vitest component test: Sign-in form validates input, displays error banners via TailAdmin `Alert`, and invokes Better Auth client.
- [x] Vitest component test: "Keep me logged in" passes session parameters.

---

## Phase 4: Admin Console (`/aurahq/admin`) & Personnel Management
**Goal:** Completely rewrite `/aurahq/admin` using TailAdmin components and wire to the new backend personnel APIs.

- [x] **Task 4.1: Eradicate Astryx UI & Rebuild with TailAdmin Components**
  - Remove all legacy Astryx classes (`divide-zinc-800`, `bg-emerald-500/10`, `text-emerald-400`).
  - Rebuild personnel directory table using `frontend/os_dashboard_source/src/components/tables/basic-tables/BasicTableOne.tsx`.
  - Fix table header and empty state column alignment (`colSpan={7}`).
  - Use TailAdmin `Badge` for roles and active status.
- [x] **Task 4.2: Wire User Registration Modal**
  - Rebuild user registration form inside a TailAdmin `Modal` component.
  - Wire submission to `POST /api/v1/admin/users` (built in Phase 0).
  - Handle loading spinners and inline error/success alerts without native browser popups.
- [x] **Task 4.3: Wire Dynamic Permission Toggles**
  - Wire the permission checkboxes ("Analytics", "Sales", "Vault") to the user record.
  - Attach `onChange` handlers dispatching `PATCH /api/v1/admin/users/{user_id}/permissions`.
  - Implement optimistic UI updates with error rollback.
- [x] **Task 4.4: Wire Personnel Status & Role Management**
  - Connect status toggles (`is_active`) and role changes to `PATCH /api/v1/admin/users/{user_id}`.

### Verification Gate (Phase 4)
- [x] Vitest integration test: Admin table loads real personnel data.
- [x] Vitest integration test: User creation modal successfully submits and adds a new user to the list.
- [x] Vitest integration test: Permission toggles fire PATCH network requests with correct payload.

---

## Phase 5: Sales Rep Portal (`/aurahq/sales`) & Dynamic Link Generator
**Goal:** Rebuild `/aurahq/sales` using TailAdmin components, eliminate dead form code, and implement the dual-mode trackable link generator.

- [x] **Task 5.1: TailAdmin UI Refactor & Dead Code Elimination**
  - Eradicate legacy Astryx styling (`divide-zinc-850`, `dark:bg-white/3`).
  - Remove duplicate, unused form state and handlers (lines 106–186 in `sales/page.tsx`).
  - Rebuild sales overview metrics using TailAdmin `EcommerceMetrics` / `ComponentCard`.
  - Rebuild recent checkouts list using TailAdmin `BasicTableOne`.
- [x] **Task 5.2: Dual-Mode Link Generator (`LinkGenerator.tsx`)**
  - Refactor `LinkGenerator.tsx` to support two distinct modes:
    1. **Trackable Marketing / Affiliate Links:** Allows reps to generate trackable links to any public AuraWorks URL (`/?ref={rep_id}&utm_source=sales...`).
    2. **Instant Checkout Links:** Generates 24-hour checkout sessions for packaged plans via `/api/v1/checkout/generate`.
  - Provide copy-to-clipboard functionality with TailAdmin tooltip or toast feedback.
- [x] **Task 5.3: Server-Side Data Scoping**
  - Ensure sales metrics and checkout tables query backend with authenticated rep identity, preventing company-wide revenue leaks.

### Verification Gate (Phase 5)
- [x] Vitest integration test: Link Generator produces valid marketing affiliate URLs and valid checkout URLs.
- [x] Vitest integration test: Sales Rep view renders scoped data without Astryx artifacts.

---

## Phase 6: Forensic Analytics Portal (`/aurahq/analytics`) Restyling
**Goal:** Rebuild `/aurahq/analytics` using TailAdmin's forensic design language, fix auth token headers, and unify API endpoints.

- [x] **Task 6.1: Eradicate Astryx Forensic Card View**
  - Completely restyle the juristic ledger / forensics cards using TailAdmin's `ComponentCard`, `BasicTableOne`, and native badges.
  - Remove `<LinkGenerator />` from the analytics header to maintain clean separation of concerns.
- [x] **Task 6.2: Fix Authentication & API Endpoints**
  - Delete obsolete `localStorage.getItem('admin_token')` references.
  - Rely on Better Auth HTTP-only session cookies (`credentials: 'include'`).
  - Replace hardcoded Railway production fallback URLs with standard `NEXT_PUBLIC_API_URL` environment variables.

### Verification Gate (Phase 6)
- [x] Vitest integration test: Analytics page fetches signal data using cookie authentication.
- [x] Visual verification: Page renders 100% TailAdmin styling with zero Astryx artifacts.

---

## Phase 7: Calendar, Tasks Board, & User Profile Modules (Zero Mock Data)
**Goal:** Transplant Calendar, Tasks, and User Profile from `frontend/os_dashboard_source` and wire them to real PostgreSQL backend models.

- [x] **Task 7.1: Calendar Module (`/aurahq/calendar`)**
  - Transplant `Calendar.tsx` and `CalendarEventModal.tsx` from `frontend/os_dashboard_source/src/components/calendar/`.
  - Replace in-memory `INITIAL_EVENTS` with real SWR/React Query calls to `/api/v1/calendar/events`.
  - Implement FullCalendar event creation, editing, and deletion with RBAC enforcement:
    - Admins: Edit/delete any event.
    - Sales Reps: Edit/delete only self-created events.
- [x] **Task 7.2: Tasks Board Module (`/aurahq/tasks`)**
  - Build the missing Tasks page (`/aurahq/tasks`) using TailAdmin card and drag-and-drop / column components.
  - Wire to `/api/v1/tasks/` endpoints for status transitions (`Todo`, `In Progress`, `Done`).
  - Add task assignment and creator filtering for Sales Reps.
- [x] **Task 7.3: User Profile Module (`/aurahq/profile`)**
  - Re-architect `UserMetaCard.tsx`, `UserAddressCard.tsx`, `Security.tsx`, and `DangerZone.tsx` using `frontend/os_dashboard_source/src/components/user-profile/`.
  - Replace hardcoded "Musharof Chowdhury" mock identity with dynamic `useSession()` user data.
  - Wire profile update modal to `PATCH /api/v1/users/me` (persisting name, phone, bio).
  - Connect Avatar upload to backend `GET /api/v1/auth/imagekit-auth` and persist uploaded URL to user record.
  - Wire "Change Password" to Better Auth password update API.
  - Wire "Sign out all devices" and "Delete account" to real session handlers.

### Verification Gate (Phase 7)
- [x] Vitest integration test: Calendar creates, edits, and deletes events against backend API with RBAC checks.
- [x] Vitest integration test: Tasks board renders and updates task status.
- [x] Vitest integration test: User Profile loads active session, updates profile info, and executes ImageKit upload flow.

---

## Phase 8: Final Polish, E-Commerce Overview, & End-to-End Audit
**Goal:** Replace raw template placeholders on root `/aurahq`, audit all table alignments, and run full test suites.

- [x] **Task 8.1: Root Overview (`/aurahq/`) Alignment**
  - Update page title and metadata (remove raw TailAdmin template title).
  - Replace raw dummy electronics/fashion demo with a unified AuraWorks overview dashboard, or route to `/aurahq/admin` / `/aurahq/sales`.
  - Fix table column alignment bug in `RecentOrders.tsx` (swap swapped Price/Category columns).
- [x] **Task 8.2: End-to-End Build & Lint Verification**
  - Run `npm run lint` and `npm run build` in `frontend` with zero errors or warnings.
  - Run full Pytest test suite in `backend` with 100% pass rate.
  - Run full Vitest test suite in `frontend` with 100% pass rate.
