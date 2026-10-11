# Architecture & Codebase Map: `frontend/os_dashboard_source` (TailAdmin)

**Source Project:** TailAdmin Free Next.js Admin Dashboard (Version 2.4.0)  
**Target Repository Path:** `frontend/os_dashboard_source` (Commit `c1cea49`)  
**Core Technologies:** Next.js 16 (App Router), React 19, Tailwind CSS v4, `next-intl` v4, ApexCharts, FullCalendar v7, TypeScript 5.9  

---

## 1. Project Overview & Identity

`frontend/os_dashboard_source` is a complete, standalone open-source administrative dashboard template developed by TailAdmin. It is built natively on the **Next.js 16 App Router** using **React 19** and **Tailwind CSS v4**.

### Key Dependencies & Libraries (`package.json`):
* **Next.js (`^16.3.4`) & React (`^19.2.8`)**: Next-generation React Server Components (RSC) and Turbopack architecture.
* **`next-intl` (`^4.14.2`)**: Full-stack internationalization engine controlling routing, server-side message loading, and client-side translation hooks.
* **Tailwind CSS v4 (`^4.1.17`) & `@tailwindcss/postcss` (`^4.3.3`)**: CSS-first Tailwind engine using modern `@theme` directive tokens (discarding legacy `tailwind.config.js`).
* **`@fullcalendar/react` (`^7.1.0`)**: Modern FullCalendar v7 scheduling engine for month, week, day, and multi-month views.
* **`apexcharts` (`^7.1.0`) & `react-apexcharts` (`^2.1.1`)**: Data visualization charts (bars, lines, spline curves).
* **`@react-jvectormap/core` & `@react-jvectormap/world`**: Interactive vector map rendering for demographic distributions.
* **`flatpickr` (`^4.6.13`)**: Datepicker input component.
* **`react-dropzone` (`^20.1.1`)**: Drag-and-drop file upload interface.
* **`@svgr/webpack` (`^8.1.0`)**: Automatically converts SVG files into first-class React components.

---

## 2. Directory Tree Map

```
frontend/os_dashboard_source/
├── .gitignore
├── .prettierrc
├── AGENTS.md
├── LICENSE
├── README.md
├── banner.png
├── eslint.config.mjs
├── jsvectormap.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.js
├── tsconfig.json
├── public/
│   └── images/
│       ├── brand/
│       ├── cards/
│       ├── carousel/
│       ├── country/
│       ├── error/
│       ├── grid/
│       ├── icons/
│       ├── logo/
│       ├── product/
│       ├── shape/
│       ├── user/
│       └── video/
└── src/
    ├── proxy.ts                      <-- Next-intl routing middleware
    ├── svg.d.ts                      <-- SVG module typing
    ├── app/
    │   ├── globals.css               <-- Tailwind v4 @theme design tokens
    │   ├── favicon.ico
    │   └── [locale]/                 <-- Root localized route segment
    │       ├── layout.tsx            <-- Root HTML/body shell & i18n provider
    │       ├── not-found.tsx         <-- Localized 404 fallback
    │       ├── (admin)/              <-- Authenticated dashboard layout group
    │       │   ├── layout.tsx        <-- Sidebar + Header shell wrapper
    │       │   ├── page.tsx          <-- E-commerce Root Dashboard
    │       │   ├── (others-pages)/   <-- Specialized feature pages
    │       │   │   ├── blank/
    │       │   │   ├── calendar/
    │       │   │   ├── profile/
    │       │   │   ├── (chart)/
    │       │   │   │   ├── bar-chart/
    │       │   │   │   └── line-chart/
    │       │   │   ├── (forms)/
    │       │   │   │   └── form-elements/
    │       │   │   └── (tables)/
    │       │   │       └── basic-tables/
    │       │   └── (ui-elements)/    <-- UI Component showcase pages
    │       │       ├── alerts/
    │       │       ├── avatars/
    │       │       ├── badge/
    │       │       ├── buttons/
    │       │       ├── images/
    │       │       ├── modals/
    │       │       └── videos/
    │       └── (full-width-pages)/   <-- Pages without sidebar/header
    │           ├── layout.tsx
    │           ├── (auth)/
    │           │   ├── layout.tsx    <-- Split-screen branded auth container
    │           │   ├── signin/page.tsx
    │           │   └── signup/page.tsx
    │           └── (error-pages)/
    │               └── error-404/page.tsx
    ├── components/
    │   ├── auth/                     <-- SignInForm, SignUpForm
    │   ├── calendar/                 <-- Calendar, CalendarEventModal, etc.
    │   ├── charts/                   <-- BarChartOne, LineChartOne
    │   ├── common/                   <-- ComponentCard, GridShape, Breadcrumbs, ThemeTogglers
    │   ├── ecommerce/                <-- Metrics, Charts, RecentOrders, Maps
    │   ├── example/                  <-- ModalExamples
    │   ├── form/                     <-- Form elements, inputs, switches, pickers
    │   ├── header/                   <-- NotificationDropdown, UserDropdown
    │   ├── tables/                   <-- BasicTableOne, Pagination
    │   ├── ui/                       <-- Alert, Avatar, Badge, Button, Dropdown, Modal, Table
    │   ├── user-profile/             <-- UserMetaCard, AddressCard, Security, DangerZone
    │   └── videos/                   <-- Aspect ratio video players
    ├── context/
    │   ├── SidebarContext.tsx        <-- Sidebar expand/collapse/hover/mobile state
    │   └── ThemeContext.tsx          <-- Light / Dark / Auto theme state & DOM sync
    ├── hooks/
    │   ├── useClickOutside.ts        <-- Click outside detection
    │   ├── useGoBack.ts              <-- History back navigation
    │   └── useModal.ts               <-- Modal open/close state hook
    ├── i18n/
    │   ├── languages.ts              <-- Language configurations & flag metadata
    │   ├── navigation.ts             <-- Localized Link, useRouter, usePathname
    │   ├── request.ts                <-- Server-side message loader
    │   └── routing.ts                <-- Routing configuration (locales, prefix policy)
    ├── icons/                        <-- 50+ SVG icons mapped via SVGR
    ├── layout/
    │   ├── AppHeader.tsx             <-- Header bar (search, alerts, user menu)
    │   ├── AppSidebar.tsx            <-- Nav sidebar (accordion submenus, collapse)
    │   ├── Backdrop.tsx              <-- Mobile drawer overlay
    │   └── SidebarWidget.tsx         <-- "Purchase Plan" promo widget
    ├── messages/
    │   └── en.json                   <-- Complete English translation dictionary
    └── utils/
        └── index.ts                  <-- cn() helper (clsx + tailwind-merge)
```

---

## 3. How the Routing Engine Works

### 3.1 The `next-intl` Localization Routing Paradigm
TailAdmin routes all pages through a dynamic route segment: `app/[locale]/`.
* **Routing Definition (`src/i18n/routing.ts`):**
  ```typescript
  import { defineRouting } from "next-intl/routing";
  export const routing = defineRouting({
    locales: ["en"],
    defaultLocale: "en",
    localePrefix: "never", // No "/en" prefix in browser URL
  });
  ```
* **Middleware Interception (`src/proxy.ts`):**
  ```typescript
  import createMiddleware from "next-intl/middleware";
  import { routing } from "./i18n/routing";

  export default createMiddleware(routing);

  export const config = {
    matcher: ["/((?!api/|_next|_vercel|.*\\..*).*)"],
  };
  ```
  `proxy.ts` intercepts all non-static requests, identifies the locale from cookies or Accept-Language headers, and rewrites the URL internally to `/[locale]/...` while keeping clean URLs (`/`, `/profile`, `/calendar`) in the browser.

* **Server-Side Message Resolution (`src/i18n/request.ts`):**
  ```typescript
  export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = routing.locales.includes(requested as Locale)
      ? (requested as Locale)
      : routing.defaultLocale;
    return {
      locale,
      messages: (await import(`../messages/${locale}.json`)).default,
    };
  });
  ```
  During SSR, `next-intl` loads the JSON dictionary (`src/messages/en.json`) and passes it to the `NextIntlClientProvider`.

* **Client-Side Navigation (`src/i18n/navigation.ts`):**
  TailAdmin exports custom navigation wrappers:
  ```typescript
  export const { Link, getPathname, redirect, usePathname, useRouter } = createNavigation(routing);
  ```
  Every internal page link uses this `Link` component instead of `next/link` to automatically preserve the current locale without hardcoding it.

---

### 3.2 Route Group Architecture

TailAdmin splits routes into two parallel route groups inside `app/[locale]/`:

#### 1. Route Group `(admin)` (Dashboard Shell)
* **Layout (`app/[locale]/(admin)/layout.tsx`):**
  Wraps pages with the full administrative chrome:
  - `<AppSidebar />` on the left.
  - `<AppHeader />` sticky on top.
  - `<Backdrop />` for mobile navigation.
  - Content container offset by `lg:ml-[290px]` (expanded) or `lg:ml-[90px]` (collapsed).
* **Routes included:**
  - `/` (`app/[locale]/(admin)/page.tsx`): E-Commerce Dashboard.
  - `/calendar`: FullCalendar interactive schedule.
  - `/profile`: User settings and identity cards.
  - `/form-elements`: Input fields, toggles, and dropzones.
  - `/basic-tables`: Tabular dataset display.
  - `/bar-chart`, `/line-chart`: ApexCharts visual analytics.
  - `/alerts`, `/avatars`, `/badge`, `/buttons`, `/images`, `/modals`, `/videos`: UI component showcases.
  - `/blank`: Minimalist starting page.

#### 2. Route Group `(full-width-pages)` (Standalone Screens)
* **Layout (`app/[locale]/(full-width-pages)/layout.tsx`):**
  Renders clean full-width containers with no sidebar or header navigation.
* **Subgroup `(auth)` (`app/[locale]/(full-width-pages)/(auth)/`):**
  - **Auth Layout:** Split-screen layout. Left side renders the login/signup form. Right side renders dark branding with `GridShape` and TailAdmin logo. Includes `<ThemeTogglerTwo />` at bottom right.
  - `/signin`: Renders `<SignInForm />` (Google SSO, X SSO, Email/Password, Remember Me, Forgot Password).
  - `/signup`: Renders `<SignUpForm />` (Name, Email, Password, Terms agreement).
* **Subgroup `(error-pages)` (`app/[locale]/(full-width-pages)/(error-pages)/`):**
  - `/error-404`: Dedicated 404 page featuring vector error illustration, `GridShape` background, and "Back to Home Page" action button.

---

## 4. Layout & Navigation Subsystems (`src/layout`)

### 4.1 `AppSidebar.tsx`
The primary navigation controller supporting desktop collapse, hover preview, and mobile sliding drawer.
* **Data Configuration:**
  - `navItems`: Primary section (`dashboard`, `calendar`, `userProfile`, `forms`, `tables`, `pages`).
  - `othersItems`: Secondary section (`charts`, `uiElements`, `authentication`).
* **Submenu Accordion Animation:**
  - Measures dynamic height using React refs: `subMenuRefs.current[key]?.scrollHeight`.
  - Animates height from `0px` to `${height}px` on toggle.
* **Active State Detection:**
  - Uses `useCallback` and `usePathname()` to check `path === pathname`.
  - Automatically expands the parent submenu when a child route is active on page load.
* **Sidebar Footer Widget (`SidebarWidget.tsx`):**
  - Displays a promotional banner promoting TailAdmin Pro with a direct checkout link to `https://tailadmin.com/pricing`.

### 4.2 `AppHeader.tsx`
The top navigation bar:
* **Responsive Sidebar Toggle:**
  - On screens $\ge$ 1280px (`xl`), triggers `toggleSidebar()` (collapsing width to 90px).
  - On screens $<$ 1280px, triggers `toggleMobileSidebar()` (opening drawer over backdrop).
* **Keyboard Navigation:**
  - Global event listener captures `Cmd+K` / `Ctrl+K` to focus the search input.
* **Dropdown Menus:**
  - `<NotificationDropdown />`: Unread badge ping animation and popover list with timestamped items.
  - `<UserDropdown />`: User avatar, profile link, language selector with flag icons, and sign-out link.
  - `<ThemeToggleButton />`: Quick light/dark switch.

### 4.3 `Backdrop.tsx`
A backdrop overlay that renders when `isMobileOpen === true` (`bg-gray-900/50 backdrop-blur-xs`), dismissing the mobile drawer upon clicking outside.

---

## 5. State Management & Contexts (`src/context`)

### 5.1 `SidebarContext.tsx`
Provides global sidebar state to the application:
* `isExpanded: boolean`: Desktop expanded state (default `true`, width `290px` vs `90px`).
* `isMobileOpen: boolean`: Mobile drawer visibility (`-translate-x-full` vs `translate-x-0`).
* `isHovered: boolean`: Hover-expansion state when sidebar is collapsed on desktop.
* Automatic route listener: Listens to pathname changes to close mobile drawers on navigation.
* Window resize handler: Automatically toggles mobile mode below 768px (`md`).

### 5.2 `ThemeContext.tsx`
Handles multi-mode theme selection:
* **Modes Supported:** `"light"`, `"dark"`, `"auto"`.
* **Persistence:** Synchronizes mode with browser `localStorage.getItem("theme-mode")`.
* **Auto Mode:** Attaches a `window.matchMedia("(prefers-color-scheme: dark)")` listener to dynamically adapt to the user's operating system preference.
* **DOM Synchronization:** Applies `class="dark"` and `data-color-scheme="dark"|"light"` directly to `document.documentElement`.

---

## 6. Component Architecture & Modules (`src/components`)

### 6.1 E-Commerce Module (`components/ecommerce/`)
The centerpiece dashboard of the template:
* **`EcommerceMetrics.tsx`**: 4 KPI stat cards (Customers, Orders, Revenue, Growth) featuring percentage change pills (`ArrowUpIcon` / `ArrowDownIcon`).
* **`MonthlySalesChart.tsx`**: ApexCharts bar chart displaying monthly performance across 12 months.
* **`MonthlyTarget.tsx`**: Radial progress bar showing current revenue vs. monthly target.
* **`StatisticsChart.tsx`**: Smooth spline area chart comparing monthly sales vs. revenue.
* **`DemographicCard.tsx` & `CountryMap.tsx`**: Interactive vector world map highlighting customer concentration by country (USA, France, Germany, etc.).
* **`RecentOrders.tsx`**: Data table displaying recent product sales with thumbnails, product names, categories, pricing, and status badges (`delivered`, `pending`, `canceled`).

### 6.2 Calendar Module (`components/calendar/`)
A FullCalendar implementation:
* **`Calendar.tsx`**: Manages view state (`dayGridMonth`, `timeGridWeek`, `timeGridDay`, `multiMonthYear`).
* **`CalendarEventModal.tsx`**: Create/edit event dialog capturing Title, Start Date, End Date, and Category Level (`Primary`, `Success`, `Warning`, `Danger`).
* **`CalendarEventItem.tsx`**: Custom event chip renderer styling events according to their category level.
* **`CalendarViewSelect.tsx`**: Custom portal-based dropdown for switching calendar views.

### 6.3 User Profile Module (`components/user-profile/`)
* **`UserMetaCard.tsx`**: Hero profile card with avatar, name, job title, email, phone, bio, social links, and an "Edit" modal.
* **`UserAddressCard.tsx`**: Displays mailing address, country, city, postal code, and tax ID with edit modal.
* **`Security.tsx`**: Password change button and interactive 2FA switch.
* **`DangerZone.tsx`**: Account termination and global device logout actions.

### 6.4 Form Elements Library (`components/form/`)
* **Text Inputs (`InputField.tsx`, `InputGroup.tsx`, `CopyInput.tsx`)**: Themed input wrappers with icons, error states, and copy-to-clipboard functionality.
* **Selection Controls (`Checkbox.tsx`, `Radio.tsx`, `Switch.tsx`)**: Fully styled toggle controls supporting dark mode.
* **Advanced Inputs (`MultiSelect.tsx`, `date-picker.tsx`, `DropZone.tsx`, `PhoneInput.tsx`)**: Complex custom selectors and drag-and-drop file uploaders.

### 6.5 Tables & UI Primitives (`components/tables/` & `components/ui/`)
* **`Table` primitives (`table/index.tsx`)**: Native JSX table abstraction (`Table`, `TableHeader`, `TableRow`, `TableCell`, `TableBody`).
* **`BasicTableOne.tsx`**: Team project status table with user avatars, stacked team member avatars, budgets, and status badges.
* **`Modal/index.tsx`**: Accessible modal overlay dialog with backdrop and escape listeners.
* **`Button.tsx`, `Badge.tsx`, `Avatar.tsx`, `Alert.tsx`**: Unified UI primitives.

---

## 7. Styling & Token Architecture (`globals.css`)

TailAdmin uses **Tailwind CSS v4**'s `@theme` block in `src/app/globals.css`. It replaces `tailwind.config.js` with pure CSS configuration:

1. **Custom Breakpoints:**
   `2xsm: 375px`, `xsm: 425px`, `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`, `3xl: 2000px`.
2. **Typography Scale:**
   `--text-title-2xl` (72px), `--text-title-xl` (60px), `--text-title-lg` (48px), `--text-title-md` (36px), `--text-title-sm` (30px), `--text-theme-sm` (14px), `--text-theme-xs` (12px).
3. **Color Tokens:**
   - **Brand:** `--color-brand-25` through `--color-brand-950` (Primary royal blue: `#465fff`).
   - **Gray Scales:** Light mode grays and dark mode backgrounds (`--color-gray-dark: #1e2640`).
   - **Status Tokens:** Success (`#10b981`), Warning (`#f59e0b`), Error (`#ef4444`).
4. **Dark Mode Variant:**
   Configured via `@custom-variant dark (&:is(.dark *));`, allowing dark styles to activate whenever the `.dark` class exists on an ancestor element.

---

## 8. Why the Migration into `industrial-intelligence` Failed

When TailAdmin was migrated into `frontend/src/app/(authenticated)/aurahq`, several fundamental incompatibilities and shortcuts occurred:

1. **i18n Conflict & Global 404s:**
   The TailAdmin `proxy.ts` middleware relied on `next-intl` rewrites looking for `[locale]/` paths. When copied to the root of `industrial-intelligence`, it intercepted every route (`/`, `/about`, `/contact`), causing global 404 errors because the main site is not localized.
2. **Orphaned Routes & Missing Pages:**
   The standalone pages under `(full-width-pages)` (`signin`, `signup`, `error-404`) were never migrated. However, the sidebar and header links pointing to `/aurahq/signin`, `/aurahq/signup`, and `/aurahq/error-404` were retained, creating broken 404 links.
3. **FullCalendar Dependency Mismatch:**
   TailAdmin was designed for FullCalendar **v7**, which bundles its own CSS. The target project attempted to install FullCalendar **v6** packages, resulting in peer dependency conflicts with React 19 and module import errors.
4. **Mock Data Retention:**
   TailAdmin was imported as a visual template, but components were left wired to static in-memory data (e.g. `INITIAL_EVENTS` in Calendar, "Musharof Chowdhury" in Profile, dummy electronics orders in `RecentOrders`), failing the project's North Star directive to wire components directly to FastAPI and PostgreSQL.
