# TailAdmin Dashboard Transplant: Implementation Plan

This document outlines the highly detailed, phase-by-phase execution plan for transplanting the TailAdmin open-source dashboard into the AuraWorks frontend, strictly retaining all UI components, visual styling, and layout, while wrapping existing backend logic and integrating custom RBAC features.

## Core Directive
- **Full UI Transplant:** Retain all original pages, logic, layout, and visual styling from TailAdmin.
- **No Mock Data:** Wire all tables, charts, and components to the real FastAPI/PostgreSQL backend schemas.
- **Preserve Existing Logic:** Keep the 100% functional backend integration (e.g., checkout, live tracking) but wrap it in the new TailAdmin UI.
- **Testing Gates:** 100% test coverage is required before moving past any task or phase.

---

## Phase 1: Full Architecture Migration & Branding Setup
**Goal:** Successfully migrate the entirety of the TailAdmin source files, fix broken dependencies, and apply initial branding requirements.

- [ ] **Task 1.1: File Transplant & Path Resolution**
  - [ ] Copy all pages, components, hooks, and types from TailAdmin to `frontend/src/app/(authenticated)/aurahq` and `frontend/src/components`.
  - [ ] Resolve all import path errors (e.g., updating relative paths to Next.js `@/` aliases).
  - [ ] Ensure all TailAdmin pages render natively without 404s (excluding the removed Logistics page).
- [ ] **Task 1.2: Branding Swaps**
  - [ ] Replace all TailAdmin logos with the existing AuraWorks SVG logo (`Logo` and `LogoIcon` components).
- [ ] **Task 1.3: Component Removals**
  - [ ] Remove the "Logistics" page and its corresponding sidebar navigation item.
  - [ ] Remove the "Purchase Plan" promo banner from the sidebar.
- [ ] **Task 1.4: Phase 1 Testing & Verification**
  - [ ] Write/update UI tests ensuring the sidebar renders correctly without the removed items.
  - [ ] Verify logo components render successfully in the Header and Sidebar.
  - [ ] Verify all remaining TailAdmin pages are reachable and render correctly without mock data errors.

---

## Phase 2: Role-Based Access Control (RBAC) & Navigation Engine
**Goal:** Implement the dynamic permission model dictating what Sales Reps and Admins can access and view.

- [ ] **Task 2.1: Navigation State Engine**
  - [ ] Update `AppSidebar.tsx` to dynamically render navigation items based on `useSession` role data (`admin` vs `sales`).
- [ ] **Task 2.2: Admin Unrestricted Access**
  - [ ] Configure the Admin role to have global access to all pages and sidebar links.
- [ ] **Task 2.3: Sales Rep Scoped Access**
  - [ ] Restrict Sales Rep sidebar and routing access strictly to: Analytics, Sales, User Profile, Calendar, Tasks, and legacy sales pages.
- [ ] **Task 2.4: Route Protection Middleware/Hooks**
  - [ ] Implement layout-level or middleware-level route protection to bounce non-Admins who attempt to force-navigate to Admin-only URLs.
- [ ] **Task 2.5: Phase 2 Testing & Verification**
  - [ ] Write integration tests simulating an Admin session (asserting full navigation visibility).
  - [ ] Write integration tests simulating a Sales Rep session (asserting restricted navigation and redirection from unauthorized routes).

---

## Phase 3: Core Feature Modules (Calendar, Tasks, User Profiles)
**Goal:** Refactor the TailAdmin Calendar, Tasks, and Profile pages to use real data, apply RBAC data-level logic, and implement ImageKit.

- [ ] **Task 3.1: Calendar & Tasks Components**
  - [ ] Strip mock data from TailAdmin Calendar and Task components.
  - [ ] Wire Calendar and Tasks to the real backend APIs.
  - [ ] Implement RBAC Rules: Sales Reps can only mutate (add/edit/remove) their own created items. Admins can mutate any item globally.
- [ ] **Task 3.2: Sales Rep Profile**
  - [ ] Strip mock data from the Profile page.
  - [ ] Wire the standard profile view for Sales Reps to update their own basic details.
- [ ] **Task 3.3: Admin Personnel Command**
  - [ ] Build an expanded UI (or sub-navigation) within the Admin Profile to display a directory of all personnel.
  - [ ] Implement a Dynamic Permissions Engine: Admin toggle switches to grant/revoke access to specific pages for individual users.
  - [ ] Build the User Registration UI for Admins to create new sales rep accounts (email, temp password, job title, access levels).
- [ ] **Task 3.4: ImageKit.io Avatar Integration**
  - [ ] Strip out the default avatar upload logic.
  - [ ] Implement ImageKit.io API for direct avatar storage and retrieval on profile updates.
- [ ] **Task 3.5: Phase 3 Testing & Verification**
  - [ ] Unit tests for Calendar/Tasks CRUD logic (verifying RBAC rules).
  - [ ] Unit tests for Admin Personnel Command (registration and permission toggles).
  - [ ] Integration tests mocking ImageKit.io success/failure states.

---

## Phase 4: Analytics, Sales Pages & Link Generator
**Goal:** Refactor data visualization components to reflect real metrics, and build the custom Link Generator tool.

- [ ] **Task 4.1: Product Page Refactoring**
  - [ ] Refactor all product pages and e-commerce tables to exclusively display AuraWorks packaged offers.
- [ ] **Task 4.2: Scoped vs Global Analytics**
  - [ ] Wire Analytics and Sales charts/metrics to real API endpoints.
  - [ ] Implement Sales Rep Scope: Metrics strictly reflect their individual performance (e.g., individual link performance).
  - [ ] Implement Admin Scope: Metrics aggregate company-wide performance.
- [ ] **Task 4.3: Affiliate Link Generator**
  - [ ] Build the Link Generator tool inside the Analytics/Sales views for creating trackable links to the main website.
  - [ ] Ensure the generated links tie back to the authenticated user's ID for tracking.
- [ ] **Task 4.4: Phase 4 Testing & Verification**
  - [ ] Tests verifying data isolation (Sales reps only seeing their own data).
  - [ ] Tests verifying Admin data aggregation.
  - [ ] Tests validating the output and persistence of the Link Generator tool.

---

## Phase 5: Legacy Dashboard Migration
**Goal:** Transplant the existing AuraWorks dashboard logic into the new TailAdmin UI structure.

- [ ] **Task 5.1: New Sidebar Category**
  - [ ] Create a dedicated parent-link section in the TailAdmin navigation for the old AuraWorks features (e.g., legacy live tracking, checkout generation).
- [ ] **Task 5.2: UI Restyling & Wrapping**
  - [ ] Move the old pages into the new `app/(authenticated)/aurahq` structure.
  - [ ] Restyle the legacy components to perfectly match the TailAdmin visual design language (fonts, colors, spacing, card styles).
- [ ] **Task 5.3: Phase 5 Testing & Verification**
  - [ ] End-to-end testing of the legacy functionality (checkout creation, etc.) wrapped in the new UI.
  - [ ] Final UI regression checks ensuring 100% visual consistency.
