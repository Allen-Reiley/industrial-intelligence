# TailAdmin Dashboard Migration & Transplant Plan

## Core Directives
- **Total Verbatim Transfer (with exceptions):** Transfer EVERYTHING from the open-source TailAdmin dashboard (layout, styling, logic, pages) verbatim, while preserving 100% of existing backend functionality (e.g., checkout generation, live tracking).
- **Routing & Structure Flexibility:** Fully authorized to modify, reorganize, and change page directories to properly transform the existing dashboard to match the TailAdmin architecture.
- **No Mock Data:** Wire components for the actual database schema and API structure. (Environment variable setup handled in a later phase).
- **Complete Aesthetic Override & Eradication:** The old custom dashboard aesthetic (including the old Astryx dark mode theme, old buttons, and old layouts) must be completely eradicated. Every single legacy page brought over into the new dashboard must be rewritten using TailAdmin's native UI components. Do not blend the two designs. Furthermore, all legacy pages must have their own distinct links integrated natively into the new TailAdmin navigation sidebar, sitting exactly alongside the other TailAdmin menu items.


---

## Phase 1: Environment Preparation, CSS, & Config Merge
**Goal:** Prepare the Next.js environment, merge Tailwind/PostCSS configurations, resolve dependency conflicts, and establish the global design language of TailAdmin in the codebase.

- [x] Clear existing dashboard CSS conflicts and establish TailAdmin global stylesheets.
- [x] Merge `tailwind.config.ts`, `postcss.config.js`, and any other config files from the TailAdmin source into the main project.
- [x] Identify and install all necessary UI dependencies used by TailAdmin (e.g., `next-intl`, `@full-ui/headless-calendar`, charts, etc.) while resolving version conflicts.
- [x] Clean up broken Next.js builds caused by previous partial migrations.

### Test Orchestration (Phase 1)
- [x] Run `npm run build` to ensure the project compiles without module resolution or dependency errors.
- [x] Verify that global styles (fonts, base tailwind layers) load properly on a blank test page.

---

## Phase 2: Layout, Routing Structure, & Sidebar Injection
**Goal:** Establish the root layout, navigation sidebar, and header according to TailAdmin's structure, allowing dynamic routing.

- [x] Migrate the TailAdmin root layout structure into the Next.js `app/` directory (adjusting routing and folder structure as needed).
- [x] Implement the TailAdmin Header component.
- [x] Implement the TailAdmin Sidebar component.
- [x] Verify basic routing functionality between empty page placeholders.

### Test Orchestration (Phase 2)
- [x] Click through all sidebar links to ensure no 404 errors occur.
- [x] Verify responsive design for sidebar (mobile collapse/expand functionality).

---

## Phase 3: Branding, Removals, & Specific UI Modifications
**Goal:** Tailor the open-source layout to AuraWorks' specific branding and structural requirements.

- [x] **Logo Swap:** Replace all instances of the TailAdmin logo with the existing AuraWorks SVG logo.
- [x] **Navigation Cleanup:** Remove the "Logistics" page and its corresponding route from the sidebar navigation.
- [x] **Promo Removal:** Remove the "Purchase Plan" div/banner from the bottom of the navigation sidebar.
- [x] **Product Hardcoding:** Refactor product pages/tables to genuinely display AuraWorks' packaged offers (discarding the template's dummy e-commerce items).

### Test Orchestration (Phase 3)
- [x] Visually inspect the Sidebar for the AuraWorks logo and verify the absence of "Logistics" and "Purchase Plan".
- [x] Verify that product tables render AuraWorks' packaged offers dynamically instead of dummy data.

---

## Phase 4: Page Integration & Existing Backend Wiring
**Goal:** Transplant the actual pages from TailAdmin and wire them to our real backend (preserving 100% of existing functionality).

- [x] Migrate ALL pages, routes, and components from the TailAdmin repository verbatim (e.g., Dashboard, Forms, Tables, Settings, CRM, etc.), strictly excluding the "Logistics" page removed in Phase 3.
- [x] Migrate the Calendar and Tasks pages.
- [x] Migrate the Analytics and Sales pages.
- [x] Migrate the User Profile page.
- [x] Inject existing backend logic (e.g., live tracking, checkout generation) into the new UI components.
- [x] Build and integrate the Link Generator tool in both Analytics and Sales views (to create trackable affiliate links).

### Test Orchestration (Phase 4)
- [x] Test the Link Generator tool to ensure valid trackable links are created.
- [x] Verify that legacy backend functionality (e.g., checkout generation) operates successfully inside the new UI wrappers.

---

## Phase 5: Role-Based Access Control (RBAC) & Data Scoping
**Goal:** Secure the UI and routes dynamically based on Admin vs. Sales Rep roles.

- [x] Implement route-level and component-level RBAC guards.
- [x] **Admin Rules:** Grant unrestricted global access to all pages, navigation, and data.
- [x] **Sales Rep Rules:** Restrict access to Analytics, Sales, User Profile, Calendar, Tasks, and existing sales pages.
- [x] **Calendar & Tasks Logic:** 
  - [x] Admins: Full CRUD across all items.
  - [x] Sales Reps: CRUD restricted to items they created.
- [x] **Analytics & Sales Logic:**
  - [x] Admins: View global aggregated company data.
  - [x] Sales Reps: View scoped individual performance data.

### Test Orchestration (Phase 5)
- [x] Log in as Sales Rep: Verify unauthorized routes are blocked and navigation is scoped.
- [x] Log in as Sales Rep: Verify Analytics/Sales data only shows individual performance, and Calendar/Tasks only allow editing of self-created items.
- [x] Log in as Admin: Verify global access and aggregation of all data.

---

## Phase 6: Admin Personnel Management & Image Uploads
**Goal:** Build the Admin directory UI and integrate ImageKit.io for avatars.

- [x] **Personnel Command (Admin Profile):** Build the expanded UI/directory of all personnel profiles for Admins.
- [x] **Permission Toggles:** Implement UI in the Admin view to toggle (grant/revoke) specific page access for individual users.
- [x] **User Registration:** Build the UI for Admins to register new profiles (email, temporary password, job title, access levels).
- [x] **Image Integration:** Rip out the template's default image upload logic.
- [x] **ImageKit.io:** Implement direct API integration for Avatar storage and retrieval via ImageKit.io.

### Test Orchestration (Phase 6)
- [x] As an Admin, register a new user and assign them specific access. Log in as that user and verify permissions.
- [x] Toggle a permission off for a user and verify immediate revocation.
- [x] Upload a new profile picture and verify it persists and serves correctly via ImageKit.io.

---

## Phase 7: Existing Dashboard Pages Migration & Restyling
**Goal:** Transplant any unique legacy pages not covered by TailAdmin into the new architecture.

- [x] Identify unique pages from the old AuraWorks dashboard (not natively in TailAdmin).
- [x] Create a new dedicated section/parent-link in the sidebar navigation for these pages.
- [x] Restyle these legacy pages to perfectly match the TailAdmin visual design language (components, typography, spacing).

### Test Orchestration (Phase 7)
- [x] Verify legacy pages exist under the new sidebar section.
- [x] Perform a UI review to ensure there is no visual discrepancy between the TailAdmin components and the migrated legacy pages.

