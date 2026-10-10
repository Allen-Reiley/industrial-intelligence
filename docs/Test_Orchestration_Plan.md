# Test Orchestration Plan

This document outlines the strict testing methodology required for the TailAdmin Dashboard Transplant. To prevent context drift and ensure absolute reliability, **no phase or task can be considered complete until 100% test coverage is achieved and verified.**

## Testing Framework & Tools
- **Framework:** Jest + React Testing Library (RTL).
- **Mocking:** `jest.mock` for API endpoints (fetch), Better Auth (`@/lib/auth-client`), and external services (ImageKit.io).
- **Environment:** `jest-environment-jsdom` to simulate browser APIs.

## Strict Test Gates

For each task in the Implementation Plan, the following sequence MUST be followed:
1. **Implementation:** Write the application code.
2. **Test Authoring:** Write unit and integration tests covering positive paths, negative paths, and RBAC constraints.
3. **Test Execution:** Run the test suite specifically for the modified files.
4. **Coverage Verification:** Ensure 100% logic coverage for the newly written code.
5. **Approval:** Only proceed to the next task if all tests pass.

---

## Phase 1 Testing: Architecture & Branding
- **UI Integrity Tests:** 
  - Assert that the `AppSidebar` renders `Logo` components successfully.
  - Assert that the "Logistics" and "Purchase Plan" strings/components do NOT exist in the DOM.
  - Assert that all remaining TailAdmin routes render their respective layout headers and main content areas without crashing.
- **Dependency Tests:**
  - Ensure any SVGs or external assets load correctly or are safely mocked (e.g., using `@svgr/webpack` mocks in Jest).

## Phase 2 Testing: RBAC & Navigation Engine
- **Mocking Strategy:** Mock the `useSession` hook to return either an `admin` role or a `sales` role.
- **Admin Tests:**
  - Mock session as `admin`.
  - Assert that restricted sidebar links (e.g., "Dashboard", "Personnel Command") ARE in the document.
- **Sales Rep Tests:**
  - Mock session as `sales`.
  - Assert that restricted sidebar links (e.g., "Dashboard", "Personnel Command") are NOT in the document.
  - Test the client-side/middleware route protection by simulating a navigation to `/aurahq/admin` and asserting that `router.replace('/aurahq/sales')` is called.

## Phase 3 Testing: Core Features (Calendar, Tasks, Profiles)
- **Data Fetching Tests:**
  - Mock `fetch` or `useSWR` to return predefined test data arrays.
  - Assert that tables and calendars render the mocked data correctly without relying on TailAdmin dummy files.
- **RBAC Mutation Tests:**
  - Calendar/Tasks: When mocked as `sales`, assert that the "Delete" or "Edit" buttons are only rendered (or clickable) for items matching the user's ID.
  - Admin Command: Assert that toggle switches successfully trigger API PATCH/PUT requests to update user permissions.
- **ImageKit Testing:**
  - Mock the ImageKit upload utility function.
  - Assert that selecting a file triggers the mock and successfully updates the UI with the returned URL.

## Phase 4 Testing: Analytics & Link Generator
- **Data Isolation Tests (Sales Scope):**
  - Verify that the API calls made from the Sales view explicitly include the user's ID in the query parameters (or that the backend is assumed to isolate it).
  - Verify that the rendered metrics match the isolated mock data.
- **Data Aggregation Tests (Admin Scope):**
  - Verify that API calls made from the Admin view fetch company-wide data.
- **Link Generator Tests:**
  - Simulate typing a target URL into the Link Generator.
  - Simulate a button click.
  - Assert that the output link is correctly formatted with the user's affiliate tracking parameters.

## Phase 5 Testing: Legacy Migration
- **End-to-End Component Tests:**
  - Take the highly complex legacy components (like Checkout Generation).
  - Render them inside the new TailAdmin Layout wrapper (`<ThemeProvider>`, `<SidebarProvider>`).
  - Perform full interaction tests (filling forms, clicking generate) to ensure the logic was perfectly preserved despite the UI facelift.

## Execution Command
To run tests and strictly enforce coverage metrics during development, use:
```bash
npm run test <filename>.test.tsx -- --coverage
```
