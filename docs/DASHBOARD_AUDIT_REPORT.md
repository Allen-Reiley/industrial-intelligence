# Comprehensive Dashboard Audit Report: Admin & Sales Rep Portals

**Repository:** `industrial-intelligence`  
**Target Environments:** Frontend (`frontend/src/app/(authenticated)/aurahq`) & Backend (`backend/app/api/v1`)  
**Audit Scope:** Logic Flaws, Security Vulnerabilities, Authentication & RBAC, Missing Functionality, UI Consistency, Template Mock Data, and North Star Alignment  
**Date of Audit:** October 2026  
**Status:** **CRITICAL REMEDIATION REQUIRED**

---

## 1. Executive Summary

A comprehensive architectural and functional audit was performed across the **Admin Console** (`/aurahq/admin`), **Sales Portal** (`/aurahq/sales`), **Unified Analytics** (`/aurahq/analytics`), **Authentication System** (`/login`, `proxy.ts`, `backend/app/core/security.py`), and **Supporting TailAdmin UI Modules** (`profile`, `calendar`, `components`).

### Key Verdict:
Despite the `TailAdmin_Migration_Plan.md` and related documents claiming that Phases 1 through 7 were complete with **"100% test coverage"** and **"zero mock data"**, the implementation is **partially migrated, architecturally fragmented, and contains severe logic defects, security vulnerabilities, and non-functional mock placeholders**.

### Summary of Critical Findings:
1. **Critical Authentication Backdoor (`security.py`)**: The backend contains an unauthenticated bypass allowing anyone who passes an email address or user ID in the `Authorization: Bearer` header or session cookie to gain immediate, full Admin privileges without entering a password.
2. **Broken Admin Registration (HTTP 405 Method Not Allowed)**: The Admin Console features a "User Registration" form that sends a `POST` request to `/api/v1/admin/users`. However, the backend router does not implement a `POST` endpoint for this route, causing user registration to fail completely.
3. **Unrestricted Public Sign-Up with Default Sales Rep Privileges**: Instead of restricting sales rep account creation to administrators, the public `/login` page allows any anonymous visitor to create an active Sales Rep account (`role: 'sales'`, `is_active: true`) and immediately access internal company telemetry.
4. **Client-Side-Only RBAC & Flash of Unauthorized Admin Content**: Middleware (`proxy.ts`) does not enforce role validation for `/aurahq/admin`. Route guards exist purely in client-side `useEffect` hooks, exposing admin data during page load or if JavaScript is intercepted.
5. **Cosmetic / Non-Functional Permission Toggles**: The permission checkboxes ("Analytics", "Sales", "Vault") in the Admin Personnel table are completely inert: they lack `onChange` handlers, have no backend schema support, and do not persist.
6. **Broken Sign-Out in Header**: The user dropdown in the top header links to `/signin` (which does not exist, resulting in a 404). It does not call `signOut()`, meaning session cookies are never cleared and users cannot log out from the header.
7. **Pervasive Template Mock Data & Unimplemented Features**:
   - The **Tasks page** (`/aurahq/tasks`) is completely missing.
   - The **Calendar** (`/aurahq/calendar`) is 100% in-memory React state with hardcoded events that vanish on refresh.
   - The **User Profile** (`/aurahq/profile`) displays hardcoded mock data ("Musharof Chowdhury") with inert save buttons and a non-functional ImageKit integration.
   - The **E-Commerce Home** (`/aurahq/`) renders the raw, unbranded TailAdmin template with dummy electronics/fashion metrics.
   - **Broken 404 Links** are embedded in the sidebar (`/aurahq/error-404`, `/aurahq/signin`, `/aurahq/signup`).

---

## 2. Authentication & Sign-In/Sign-Up Audit

### 2.1 Critical Backend Authentication Backdoor
* **File:** `backend/app/core/security.py` (Lines 155–168)
* **Defect:** In `get_current_user`, the code explicitly falls back to matching raw user IDs or email addresses if a session token is not found:
  ```python
  # 2. Check for direct User ID or Email matching in test/dev environment
  user_stmt = select(User).where(
      (User.id == token) | (User.email == token)
  )
  res_u = await db.execute(user_stmt)
  direct_user = res_u.scalars().first()
  if direct_user:
      if not direct_user.is_active:
          raise HTTPException(status_code=403, detail="Account inactive")
      return direct_user
  ```
* **Impact (High Severity):** There is no environment guard (`settings.ENVIRONMENT == "development"`). An attacker can authenticate as the primary administrator simply by sending:
  `Authorization: Bearer admin@auraworks.co.za` or setting cookie `better-auth.session_token=admin@auraworks.co.za`.
  This completely bypasses password and OAuth authentication.

### 2.2 Unrestricted Public Sign-Up vs. Closed Admin-Only Registration
* **Files:** `frontend/src/app/login/page.tsx` & `frontend/src/lib/auth.ts`
* **Defect:**
  - The North Star Directive specifies:
    > *"User Registration: Provide a UI for the Admin to register new profiles (inputting designated email, temporary password, job title, and access levels) to hand off to new sales reps."*
  - In `frontend/src/lib/auth.ts` (lines 45–56), Better Auth is configured with:
    ```typescript
    additionalFields: {
      role: { type: "string", defaultValue: "sales" },
      is_active: { type: "boolean", defaultValue: true }
    }
    ```
  - In `frontend/src/app/login/page.tsx`, the public authentication form contains a toggle button between `"Sign In"` and `"Sign Up"`. Any anonymous visitor on the internet can register an account, automatically receive the `sales` role, and immediately gain access to `/aurahq/sales`, customer checkout telemetry, and client data.
* **Impact:** Direct breach of internal sales portal access control.

### 2.3 Broken Admin Registration Endpoint (HTTP 405 Method Not Allowed)
* **Files:** `frontend/src/app/(authenticated)/aurahq/admin/page.tsx` (Lines 433–450) & `backend/app/api/v1/admin.py`
* **Defect:**
  - In `admin/page.tsx`, the Admin Registration form submits a `POST` request to `${cleanApiBase}/api/v1/admin/users`:
    ```typescript
    const res = await fetch(`${cleanApiBase}/api/v1/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(Object.fromEntries(formData))
    });
    ```
  - In `backend/app/api/v1/admin.py`, the only endpoints registered under `/users` are:
    - `GET /users` (`list_personnel`)
    - `PATCH /users/{user_id}` (`update_personnel`)
    - `DELETE /users/{user_id}` (`delete_personnel`)
  - **There is NO `POST /users` endpoint!**
* **Impact:** When an administrator attempts to create a new user profile via the dashboard, the request fails immediately with **HTTP 405 Method Not Allowed**.

### 2.4 Inert & Faulty Form Elements on `/login`
* **File:** `frontend/src/app/login/page.tsx`
* **Defects:**
  1. **"Forgot password?" Button (Lines 268–274):** The button is rendered without an `onClick` handler or form action:
     ```tsx
     <button type="button" className="...">Forgot password?</button>
     ```
     Clicking it produces zero response.
  2. **"Keep me logged in" Checkbox (Lines 263, 93–97):** State `isChecked` is updated when the user clicks the checkbox, but it is never passed to `signIn.email()`. The session duration remains unchanged.
  3. **Missing Microsoft OAuth UI:** Commit `4637452` configured Microsoft OAuth on the server, but the login UI only renders Google and GitHub buttons.
  4. **Browser `alert()` on Failure:** Multiple error states fall back to native browser alert modals rather than modern UI feedback banners.

### 2.5 Broken Sign-Out in Top Header (`UserDropdown.tsx`)
* **File:** `frontend/src/components/header/UserDropdown.tsx` (Lines 248–254)
* **Defect:** The "Sign Out" button at the bottom of the user profile dropdown is implemented as:
  ```tsx
  <Link href="/signin" className="...">
    {t("signOut")}
  </Link>
  ```
  - It does NOT call `signOut()` from `@/lib/auth-client`.
  - It does NOT invalidate the Better Auth session token on the server or delete cookies.
  - It points to `/signin`, which does not exist (resulting in a 404).
  - Because the session cookie remains active, navigating back to `/login` causes `proxy.ts` to immediately redirect the user back into `/aurahq/sales`. Users cannot log out via the header.

### 2.6 Faulty Login Redirection in Middleware (`proxy.ts`)
* **File:** `frontend/src/proxy.ts` (Lines 36–41)
* **Defect:**
  ```typescript
  if (url.pathname === '/login') {
    if (token) {
      url.pathname = '/aurahq/sales';
      return NextResponse.redirect(url);
    }
  }
  ```
  When any authenticated user (including an **Administrator**) visits `/login`, the proxy unconditionally redirects them to `/aurahq/sales` instead of checking their role and routing admins to `/aurahq/admin`.

---

## 3. Role-Based Access Control (RBAC) & Routing Flaws

### 3.1 Client-Side-Only Security Guards
* **Files:** `frontend/src/proxy.ts`, `frontend/src/app/(authenticated)/aurahq/layout.tsx`, & `frontend/src/app/(authenticated)/aurahq/admin/page.tsx`
* **Defect:**
  - `proxy.ts` only checks if a token exists:
    ```typescript
    if (url.pathname.startsWith('/aurahq')) {
      if (!token) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
    }
    ```
    It performs **no role-based authorization check**.
  - Protection for `/aurahq/admin` is relegated to client-side `useEffect` in `admin/page.tsx`:
    ```typescript
    useEffect(() => {
      if (!isPending) {
        const role = (session?.user as any)?.role || "sales";
        if (role !== "admin") {
          router.replace("/aurahq/sales");
        }
      }
    }, [session, isPending, router]);
    ```
* **Impact:**
  - If a Sales Rep navigates to `/aurahq/admin`, the Next.js bundle for the admin page is downloaded and executed.
  - While `session` is loading (`isPending === true`), there is a visible flash of administrative controls and telemetry.
  - If client-side JavaScript execution is interrupted or disabled, the page does not redirect.

### 3.2 Layout Redirects Unauthorized Users to Raw Template
* **File:** `frontend/src/app/(authenticated)/aurahq/layout.tsx` (Lines 61–71)
* **Defect:**
  ```typescript
  if (role !== "admin") {
    const allowedPaths = ["/aurahq", "/aurahq/analytics", "/aurahq/sales", "/aurahq/calendar", "/aurahq/profile"];
    if (!allowedPaths.some(p => pathname === p || pathname.startsWith(p + "/"))) {
      router.push("/aurahq");
    }
  }
  ```
  When a sales rep tries to navigate to an unauthorized page (e.g. `/aurahq/admin`, `/aurahq/alerts`), the layout redirects them to `/aurahq`.
  However, `/aurahq` is the raw, unconfigured TailAdmin e-commerce demo (`EcommerceMetrics`, `MonthlySalesChart`, `RecentOrders`). They should be redirected to `/aurahq/sales`.

### 3.3 Client-Side Query Parameter Attribution Leaks
* **File:** `frontend/src/app/(authenticated)/aurahq/sales/page.tsx` (Lines 80–84)
* **Defect:**
  ```typescript
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;
  const urlSuffix = userRole !== 'admin' && userId ? `?sales_rep_id=${userId}` : '';
  ```
  - Data scoping is delegated to the client: the frontend appends `?sales_rep_id=${userId}`.
  - During initial render before `session` has resolved, `userId` is `undefined`, so `urlSuffix` evaluates to `""`.
  - The SWR hooks fetch `${cleanApiBase}/api/v1/sales/checkouts` and `/metrics` without a query param.
  - If the backend default is not strictly bound to the authenticated cookie, company-wide checkout sessions and aggregate revenue figures leak to sales reps.

---

## 4. Admin Dashboard Audit (`/aurahq/admin`)

### 4.1 Inert / Mock Permission Toggles
* **File:** `frontend/src/app/(authenticated)/aurahq/admin/page.tsx` (Lines 382–390)
* **Defect:**
  ```tsx
  <td className="px-6 py-4">
    <div className="flex gap-2">
      {["Analytics", "Sales", "Vault"].map(page => (
        <label key={page} className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
          <input 
            type="checkbox" 
            className="rounded border-gray-300" 
            defaultChecked={user.role === 'admin' || page !== 'Vault'} 
          />
          {page}
        </label>
      ))}
    </div>
  </td>
  ```
* **Impact:**
  - The checkboxes have no `onChange` handler.
  - The backend `User` model does not possess a permissions array or JSON column for route access.
  - Checking or unchecking these boxes does not trigger any network request, does not persist to PostgreSQL, and does not alter what routes the sales rep can access.
  - This is a purely cosmetic placeholder directly contradicting Phase 6 requirements.

### 4.2 Astryx Theme Remnants & Mixed Design Language
* **File:** `frontend/src/app/(authenticated)/aurahq/admin/page.tsx`
* **Defect:**
  - Line 221 contains the explicit comment `{/* Astryx Top Navigation */}`.
  - The page mixes legacy Astryx styling classes (`bg-emerald-500/10`, `text-emerald-400`, `hover:bg-red-950/50`, `divide-zinc-800`) with TailAdmin styles.
  - Rather than utilizing TailAdmin's native `BasicTableOne`, `Modal`, `Button`, and `Badge` components, the page renders bespoke raw HTML tables, raw input elements, and browser `alert()` popups.

### 4.3 Table Column Alignment Bug
* **File:** `frontend/src/app/(authenticated)/aurahq/admin/page.tsx` (Line 414)
* **Defect:**
  The `thead` defines 7 columns (`User`, `Role`, `Status`, `Permissions`, `Links Gen`, `Paid Closed`, `Actions`), but the empty state row specifies:
  ```tsx
  <td colSpan={6} className="px-6 py-12 text-center ...">
    No personnel profiles match the search criteria.
  </td>
  ```
  When no users match the search filter, the empty state row is short by 1 column, causing layout distortion in standard browsers.

### 4.4 Missing Admin Directory in Profile View
* **Migration Plan Requirement:**
  > *"Admin Profile / Personnel Command: The Admin profile must feature an expanded UI (or sub-navigation) to view a directory of all other personnel profiles."*
* **Reality:**
  The Admin Profile at `/aurahq/profile` is identical to the Sales Rep profile and contains no personnel directory or administrative sub-navigation.

---

## 5. Sales Rep Dashboard Audit (`/aurahq/sales`)

### 5.1 Redundant / Dead Form Code
* **File:** `frontend/src/app/(authenticated)/aurahq/sales/page.tsx` (Lines 106–186)
* **Defect:**
  Lines 106–186 define duplicate form state variables (`businessName`, `contactEmail`, `contactPhone`, `selectedPlan`, `priceInput`, `domain`, `generating`) and a duplicate `handleGenerateCheckout` handler.
  However, the page renders `<LinkGenerator onSuccess={...} />` at line 265, rendering all the top-level form state and handlers completely dead and unused.

### 5.2 Affiliate Link Generator vs. Checkout Link Generator
* **Migration Plan Requirement:**
  > *"Link Generator Tool: Both views must include a functional Link Generator tool that allows the user to create trackable affiliate links pointing to any page on the main website."*
* **Reality:**
  `LinkGenerator.tsx` only creates a **24-hour payment checkout link** for SaaS packages (`/api/v1/checkout/generate`). It does not allow generating trackable marketing or affiliate links to arbitrary website pages (e.g., `/solution`, `/features`, `/blog`).

### 5.3 Hardcoded Astryx Dark Mode Styling
* **File:** `frontend/src/app/(authenticated)/aurahq/sales/page.tsx` (Lines 299, 211, 224, 237, 250)
* **Defect:**
  The table body uses `divide-zinc-850`, and the card backgrounds use `dark:bg-white/3`. These are remnants of the old Astryx dashboard design rather than standard TailAdmin tokens (`dark:bg-gray-900`, `dark:border-gray-800`).

---

## 6. Analytics Page Audit (`/aurahq/analytics`)

### 6.1 Broken Authentication via Deprecated `admin_token`
* **File:** `frontend/src/app/(authenticated)/aurahq/analytics/page.tsx` (Lines 104–115)
* **Defect:**
  ```typescript
  const fetchClients = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/clients/`, {
        headers,
        credentials: 'include'
      });
  ```
* **Impact:**
  - The application uses Better Auth, which stores sessions in HTTP-only cookies (`better-auth.session_token`).
  - No part of the login flow populates `localStorage.getItem('admin_token')`.
  - The Authorization header is never attached.
  - If the backend requires a Bearer token or client admin access, this call fails or falls back to an unauthenticated state, leaving the client list empty and showing `"No Signal Attributed"`.

### 6.2 Inconsistent Fallback API URLs
* **Files:** `analytics/page.tsx` (Line 67) vs. `admin/page.tsx` (Line 35) & `sales/page.tsx` (Line 30)
* **Defect:**
  - `admin/page.tsx` & `sales/page.tsx`:
    `process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`
  - `analytics/page.tsx`:
    `process.env.NEXT_PUBLIC_API_URL || "https://dynamic-flow-production-a5d6.up.railway.app"`
  In local development or custom deployments lacking `NEXT_PUBLIC_API_URL`, the analytics page points to an external Railway production deployment while the rest of the dashboard talks to localhost.

### 6.3 100% Unmigrated Astryx Interface
* **File:** `frontend/src/app/(authenticated)/aurahq/analytics/page.tsx`
* **Defect:**
  The North Star Directive commanded complete eradication of the Astryx aesthetic. However, `analytics/page.tsx` is an exact copy of the old "Juristic Ledger / Forensic Card View" with emerald borders, custom SVG badges, and zero TailAdmin components.
  Additionally, `<LinkGenerator />` was blindly inserted at the top of the analytics page (line 189), cluttering visitor forensics with a checkout link builder.

---

## 7. Core Feature Modules Audit

### 7.1 Calendar (`/aurahq/calendar` & `Calendar.tsx`)
* **Files:** `frontend/src/app/(authenticated)/aurahq/(others-pages)/calendar/page.tsx` & `frontend/src/components/calendar/Calendar.tsx`
* **Defects:**
  1. **Zero Database Integration (100% Mock State):**
     Events are initialized from a static array (`INITIAL_EVENTS`) and maintained strictly in React `useState`:
     ```typescript
     const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
     ```
     Any event created or updated by an Admin or Sales Rep is lost as soon as the page is refreshed. There is no PostgreSQL schema or FastAPI endpoint for calendar events.
  2. **Fake Shared State & Broken RBAC:**
     The code attempts to restrict editing:
     ```typescript
     if (userRole !== 'admin' && createdBy !== userId) {
       alert("You do not have permission to edit this event.");
       return;
     }
     ```
     However, because `INITIAL_EVENTS` do not have a `createdBy` field, Sales Reps receive an alert on all default events. Furthermore, state is local to each client browser, so no company calendar sharing exists.

### 7.2 Tasks Page: Completely Missing
* **Migration Plan Requirement:**
  > *"Phase 3: Core Feature Modules (Profiles, Calendar, Tasks)... Build Calendar/Tasks with creator-only edit restrictions for Sales. Admins: Full CRUD across all items."*
* **Reality:**
  There is no `/aurahq/tasks` route, no tasks page, and no task board component anywhere in the codebase. The feature was simply never built, despite being marked complete in `TailAdmin_Migration_Plan.md`.

### 7.3 User Profile (`/aurahq/profile` & Associated Cards)
* **Files:** `frontend/src/components/user-profile/UserMetaCard.tsx`, `UserAddressCard.tsx`, `Security.tsx`, `DangerZone.tsx`
* **Defects:**
  1. **Hardcoded Mock Identity:**
     The profile cards do not query the logged-in user session (`useSession()`). For both Admins and Sales Reps, they render:
     - Name: `Musharof Chowdhury`
     - Role: `Team Manager`
     - Email: `randomuser@pimjo.com`
     - Location: `Phoenix, Arizona, United States`
     - Avatar: `/images/user/owner.png`
  2. **Inert Modal Actions:**
     The `handleSave` function inside `UserMetaCard` and `UserAddressCard` contains:
     ```typescript
     const handleSave = () => {
       console.log("Saving changes...");
       closeModal();
     };
     ```
     Edits in the modal are never saved anywhere.
  3. **Broken ImageKit.io Integration:**
     - Uses `publicKey = "mock_public_key"` as fallback.
     - Calls `fetch('/api/v1/auth/imagekit-auth')`, which **does not exist** on the FastAPI backend (returns 404).
     - The upload success callback `onSuccess={(res) => console.log("Uploaded", res)}` does not persist the image URL to the user record or session.
  4. **Inert Security & Danger Zone Buttons:**
     - `Security.tsx`: "Change Password" has no `onClick` handler. "Two-factor authentication (2FA)" is a local boolean state that triggers no backend action.
     - `DangerZone.tsx`: "Logout all devices" and "Delete account" buttons have no `onClick` handlers.

---

## 8. Navigation, Header, & Sidebar Audit

### 8.1 Dead Links in Sidebar (`AppSidebar.tsx`)
* **File:** `frontend/src/layout/AppSidebar.tsx`
* **Defects:**
  1. **Error 404 Link (Line 80):** `{ key: "error404", path: "/aurahq/error-404" }`.
     The page `/aurahq/error-404` does not exist. Clicking it navigates to a broken route.
  2. **Auth Submenu Links (Lines 110–111):**
     `{ key: "signIn", path: "/aurahq/signin" }` and `{ key: "signUp", path: "/aurahq/signup" }`.
     Neither `/aurahq/signin` nor `/aurahq/signup` exists (the app's actual auth page is `/login`). Both result in 404 errors.
  3. **User Profile Dropdown Links (`UserDropdown.tsx` Lines 91, 116, 141):**
     All link to `/profile`, but the actual profile page is located at `/aurahq/profile`. All three links produce 404 errors.

### 8.2 Misplaced Template Demos in Admin Sidebar
* **File:** `frontend/src/layout/AppSidebar.tsx` (Lines 85–114, 140)
* **Defect:**
  The sidebar exposes raw template showcase pages (`/aurahq/alerts`, `/aurahq/avatars`, `/aurahq/badge`, `/aurahq/buttons`, `/aurahq/images`, `/aurahq/videos`, `/aurahq/form-elements`, `/aurahq/basic-tables`) to the Administrator.
  These are component demonstration pages from TailAdmin containing dummy placeholder text and should not be exposed in production navigation.

### 8.3 Hardcoded Template Notifications
* **File:** `frontend/src/components/header/NotificationDropdown.tsx` (Lines 88–380)
* **Defect:**
  Renders static, hardcoded template notifications (e.g., *"Terry Franci requests permission - Project: Nganter App"*, *"Brandon Philips"*).
  The notifications have no connection to AuraWorks, lead events, or sales alerts.

### 8.4 Root Dashboard (`/aurahq/`) & Reversed Table Headers
* **Files:** `frontend/src/app/(authenticated)/aurahq/page.tsx` & `frontend/src/components/ecommerce/RecentOrders.tsx`
* **Defects:**
  1. The root dashboard page at `/aurahq/` retains the unbranded metadata title:
     `"Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template"`
  2. In `RecentOrders.tsx` (lines 178–184), the table column values are swapped:
     - The **Price** cell (`{product.price}`) is rendered in the column under the **Category** header.
     - The **Category** cell (`{t('categories.' + product.category)}`) is rendered in the column under the **Price** header.

---

## 9. Test Coverage vs. Plan Reality

### Discrepancy Analysis:
`TailAdmin_Migration_Plan.md` mandated:
> *"Strict Testing Gates: You may not move past any Phase or Task unless it has 100% test coverage."*

In reality:
1. Only **4 unit test files** exist for the entire `aurahq` dashboard:
   - `admin.test.tsx` (contains only 2 shallow tests with hardcoded mocks)
   - `sales.test.tsx` (basic render test)
   - `dashboard.test.tsx` (basic render test)
   - `login.test.tsx` (basic render test)
2. **Zero tests exist for:**
   - RBAC routing and permission enforcement
   - Calendar CRUD operations and creator permissions
   - Admin user registration flow
   - ImageKit image upload handling
   - Personnel role change or status toggle
   - Dynamic Link Generator output verification
   - Profile update mutations

---

## 10. Prioritized Remediation Roadmap

| Priority | Component | Issue | Required Fix |
| :--- | :--- | :--- | :--- |
| **P0 - Critical** | Backend Security | Unauthenticated backdoor in `security.py` | Remove fallback lines 155–168 in `security.py` or restrict strictly to automated test runners. |
| **P0 - Critical** | Admin API | Missing `POST /api/v1/admin/users` | Implement `POST` handler in `backend/app/api/v1/admin.py` to create users with password hashing. |
| **P0 - Critical** | Auth Flow | Open public registration grants `sales` role | Disable public sign-up or set default role to unapproved/guest; restrict rep creation to Admin Console. |
| **P0 - Critical** | App Header | "Sign Out" button links to `/signin` (404) | Replace `<Link>` with an `onClick` handler that calls `signOut()` and redirects to `/login`. |
| **P1 - High** | Route Guards | RBAC is client-side only | Add server-side session and role inspection in `proxy.ts` to block unauthorized role access. |
| **P1 - High** | Navigation | Dead 404 links in sidebar & header | Fix routes: point sign-in to `/login`, profile to `/aurahq/profile`, and remove `/aurahq/error-404`. |
| **P1 - High** | Admin Console | Permission toggles are inert | Add database column / table for permissions and wire `onChange` PATCH requests to backend. |
| **P1 - High** | Analytics | Uses obsolete `localStorage('admin_token')` | Refactor `analytics/page.tsx` to rely on Better Auth cookies or session Bearer tokens. |
| **P2 - Medium** | Calendar | 100% in-memory mock data | Create `CalendarEvent` database model and FastAPI CRUD endpoints. |
| **P2 - Medium** | Tasks | Completely missing module | Build the Tasks board component and wire to backend task/lead tracking. |
| **P2 - Medium** | User Profile | Hardcoded "Musharof Chowdhury" mock data | Wire `useSession()` data to profile cards; implement real ImageKit upload endpoint and save handler. |
| **P2 - Medium** | Root `/aurahq/` | Raw template e-commerce demo | Replace dummy demo with role-based dashboard landing or redirect to `/aurahq/sales` / `/aurahq/admin`. |
| **P3 - Low** | UI Polish | Template showcase items in sidebar | Remove dev UI component showcase pages (`/alerts`, `/badge`, etc.) from production sidebar. |
| **P3 - Low** | Table Header | `RecentOrders.tsx` Price/Category swapped | Swap `TableCell` order to match header columns. |

---

*Report prepared and compiled into repository documentation.*
