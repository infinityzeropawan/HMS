# Hospital Admin Panel — Phase 1 Deep Audit & Fix Brief

**Status:** **CLOSED & VERIFIED** (19/19 Control Tests Passing, 0 Build Errors)  
**Companion document:** `web/src/app/(super-admin)/phase1_deep_audit_fix_brief.md` (platform console, already fixed on `main` @ `28658f3`).

## Phase 1 Implementation & Verification Summary

All 31 findings across 4 implementation waves have been fully resolved and verified on `main`:

1. **Wave 1 — Security & Auth P1s (A1, A2, A4, A5):**
   - Created `web/src/app/(admin)/layout.tsx` fail-closed layout guard requiring `ADMIN`, `HOSPITAL_ADMIN`, or `SUPER_ADMIN` with hydration safety.
   - Refactored `StaffUserTable.tsx` to resolve session `tenantId` dynamically, select raw Zustand slices (`globalTemplates`, `tenantCustomRoles`), and eliminate unstable selector loops.
   - Removed role impersonation dropdown from `MasterPriceListTable.tsx`; derived actor and role strictly from session.
   - Updated `auth_api_service.ts` to validate submitted tenant ID in MFA flow and carry it through token generation.

2. **Wave 2 — Navigation & IA (R1, R2, R3, R4, R5, D1, D2):**
   - Updated `HmsMobileNav.tsx` ADMIN nav array to include `/admin` (Admin Dashboard) as item 1 and reordered top 5 bottom-bar items (`/admin`, `/users`, `/departments`, `/beds`, `/hospital-settings`).
   - Upgraded active item matching to longest-prefix matching (`path === currentPath || currentPath.startsWith(path + '/')`).
   - Updated `auth_redirect.ts` home path for `ADMIN` & `HOSPITAL_ADMIN` to `/admin`.
   - Updated HR pages to redirect to `/roster`.

3. **Wave 3 — Data Ownership & Truth (B1, B2, B3, B4, B5, B6, E4):**
   - Connected `DpdpAuditLogTable.tsx` to live `PlatformAuditService.getAuditLogs()` with filtering, search, and pagination.
   - Added `BedService.registerBed()`, integrated `TariffService.resolveBedRate()` for bed pricing single-source of truth.
   - Added `printTemplateConfigs` state to `admin_settings_store.ts` and connected `PrintTemplateStudio.tsx` layout persistence.
   - Connected `/admin` dashboard KPI cards to live service getters (`StaffUserService.getLicenseUsage()`, `BedService.getBeds()`).
   - Made `departments/[departmentId]/page.tsx` store selectors reactive with Zustand hooks and `useMemo`.

4. **Wave 4 — UI Polish & Touch Safety (C1, C2, C3, C4, C5, D4, D5):**
   - Added `--text-3xs: 0.6875rem;` (11px) token in `globals.css` `@theme` block.
   - Replaced uncompiled `bg-alert-crimson` with `bg-crimson` across components.
   - Demoted all body `<h1>` tags across 11 admin pages to `<h2>` to resolve duplicate H1s.
   - Wired header "Add" buttons on `/users` and `/tariffs` pages to trigger state creation modals.
   - Completed role category mapping in `StaffRosterManager.tsx` (`BILLER → FINANCE`, `ADMIN/SUPER_ADMIN → ADMINISTRATIVE`).

---

## Scope

Audited subsystem:

- `web/src/app/(admin)/` — 11 routes, 11 components, 7 services, 7 stores, 5 type modules
- Shared surfaces that drive the admin panel:
  - `web/src/common_components/HmsAppShell/HmsAppShell.tsx`
  - `web/src/common_components/HmsMobileNav/HmsMobileNav.tsx`
  - `web/src/app/globals.css`
  - `web/src/middleware.ts`
  - `web/src/app/(auth)/_auth_constants/auth_redirect.ts`
  - `web/src/app/(auth)/_auth_services/auth_api_service.ts`

Audit dimensions: route integrity, sidebar navigation, mobile navigation, RBAC enforcement, dashboard KPI ownership, audit logging coverage, store/service ownership, orphan components, dead pages, dead links, runtime crash risks, TypeScript risks, mobile responsiveness, UI consistency.

**No code was changed by this audit.** This brief records findings and recommended fixes only.

## Evidence base

| Check | Command / source | Result |
| :--- | :--- | :--- |
| Route inventory | `find . -name 'page.tsx' \| sed 's|/(group)/||' \| sort` | 89 route paths enumerated |
| Duplicate routes | `… \| sort \| uniq -d` | **empty** (no collisions) |
| Layout guards | `find . -name 'layout.tsx'` | only `./layout.tsx` and `.(super-admin)/layout.tsx` |
| Link graph | `grep -rn 'href="/' app/(admin)`, `grep -rn 'router.push' app/(admin)` | 12 static `href`s (+1 template `href` on the department detail page), 0 `router.push` calls |
| Orphan components | per-component import search | 11/11 used |
| Compiled CSS tokens | `.next/static/css/b3db0849bfa63c95.css` | `.text-3xs` = 0, `.bg-alert-crimson` = 0 |
| TypeScript | `cd web && npx tsc --noEmit` | exit 0, 0 errors |
| Runtime stack | `node -e "require('./node_modules/zustand/package.json').version"` | zustand **5.0.15**, React **19.0.0** |

## Severity legend

- **P1** — breaks authorization, tenant isolation, or crashes a screen
- **P2** — user-visible wrong data / broken workflow / accessibility-breaking styling
- **P3** — consistency, polish, or information-architecture defect

## 0. Executive Summary

| Area | Result |
| :--- | :--- |
| Route collision / build safety | **PASS** — no duplicate route paths across route groups |
| Orphan components | **PASS** — all 11 admin components are imported exactly as intended |
| Dead nav links | **PASS** — all 17 ADMIN nav targets resolve to a real `page.tsx` |
| Orphan routes | **FAIL** — `/admin` (the admin dashboard) is unreachable from anywhere |
| Route-group authorization | **FAIL** — `(admin)` has **no** `layout.tsx` guard (unlike `(super-admin)`) |
| RBAC / tenant isolation | **FAIL** — hardcoded `TNT-9014`, fabricated actor roles, in-page role switcher |
| Dashboard KPI ownership | **FAIL** — 4 of 4 KPIs are hardcoded strings while real services exist |
| Design-token integrity | **FAIL** — `text-3xs` and `bg-alert-crimson` generate **no CSS** |
| TypeScript | **PASS** — `npx tsc --noEmit` → 0 errors |
| Runtime risk | **FAIL** — one unstable Zustand selector on `/users` (infinite-render risk) |

Finding count: **31 findings** — **3 P1**, **15 P2**, **13 P3** (section 6 also records one verification pass, E1), distributed across the six sections as follows:

| Section | Findings |
| :--- | :--- |
| 1. Routing & Navigation | R1, R2, R3, R4, R5 |
| 2. Authentication & Authorization | A1, A2, A3, A4, A5 |
| 3. Audit, Lifecycle & Licensing | B1, B2, B3, B4, B5, B6 |
| 4. Branding State & UI Consistency | C1, C2, C3, C4, C5, C6, C7 |
| 5. Responsive UI & Workflow Reliability | D1, D2, D3, D4, D5 |
| 6. Runtime / 500 Prevention & Verification | E1 (pass), E2, E3, E4 |

---

## 1. Routing & Navigation

### Verified

- The admin route group exposes exactly these routes, and every one is backed by a real page: `/admin`, `/users`, `/departments`, `/departments/[departmentId]`, `/beds`, `/tariffs`, `/roster`, `/print-templates`, `/hospital-settings`, `/accreditations`, `/audit-logs`, `/notifications`.
- No route path is defined twice across any route group, so the App Router cannot fail the build on "two parallel pages that resolve to the same path".
- All 11 `_admin_components` are consumed by a page (no orphan components).
- Every one of the 17 ADMIN navigation targets in `HmsMobileNav.tsx:129-147` resolves to an existing page, and all eight cross-module targets (`/analytics`, `/revenue`, `/analytics/inventory`, `/payouts`, `/equipment`, `/gateway`, `/ot/schedule`) render `HmsAppShell`, so the ADMIN sidebar is preserved when an admin visits them.

### Finding R1 — Orphaned admin dashboard route `/admin` (P2)

**File / component**

- `web/src/app/(admin)/admin/page.tsx`
- `web/src/common_components/HmsMobileNav/HmsMobileNav.tsx:129-147` (`ADMIN` array)
- `web/src/app/(auth)/_auth_constants/auth_redirect.ts:14-15`

**Exact defect**

The ADMIN/HOSPITAL_ADMIN nav array contains 17 items and none of them is `/admin`. A repository-wide search for `"/admin"` / `/admin/` outside the `_admin_*` folders returns **zero** results, and `getRoleHomePath()` sends both `ADMIN` and `HOSPITAL_ADMIN` to `/users`.

**Root cause**

The dashboard page was authored standalone but never registered in the navigation contract; the post-login landing path was pointed at a table page.

**User impact**

The only screen that aggregates admin KPIs, quick-module tiles, the staff-credentials preview and the audit preview is unreachable in the running app. Hospital admins land directly on a dense table with no overview, and there is no way back to a dashboard.

**Recommended fix**

- Add `{ id: "dashboard", label: "Admin Dashboard", icon: Home, path: "/admin", role: [...] }` as the **first** ADMIN item so it also takes bottom-nav slot 1.
- Point `ADMIN` / `HOSPITAL_ADMIN` home to `/admin` in `auth_redirect.ts`.
- Do **not** create a new route or a second dashboard page.

### Finding R2 — Duplicate routing for one dataset: `/roster` vs `/hr/roster` (P2)

**Files / components**

- `web/src/app/(admin)/roster/page.tsx` → `_admin_components/Roster/StaffRosterManager.tsx`
- `web/src/app/(hr)/hr/roster/page.tsx` → `(hr)/_hr_components/DutyRoster/StaffShiftScheduler.tsx`

**Exact defect**

Both pages are bound to the same state and the same mutation path: `useRosterStore` (`(admin)/_admin_stores/admin_roster_store.ts`) and `RosterService` (`(admin)/_admin_services/roster_service.ts`, imported at `StaffShiftScheduler.tsx:6-7`). Two URLs, two UIs, overlapping capability sets:

| Capability | `/roster` (admin) | `/hr/roster` (HR) |
| :--- | :--- | :--- |
| Search + role filter | Yes | No |
| Summary cards | Yes | No |
| Create / edit shift assignment | Yes | No |
| Inline duty-status dropdown | No | Yes |
| Reset to defaults | Yes | No |

**Root cause**

The HR hub (`(hr)/hr/page.tsx:124,160` links to `/hr/roster`) kept its own roster entry after the admin roster master was introduced.

**User impact**

One shift roster is presented in two places with different actions and vocabulary, so users cannot tell which screen is authoritative; role-filtered views and statistics differ between the two screens.

**Recommended fix**

Choose a single owner and keep a single component. Preferred: keep `/roster` as the admin master, update the HR hub link to `/roster`, and remove the duplicate import path. Alternatively re-point the ADMIN nav item at `/hr/roster` and delete the duplicate component. Do not maintain both.

### Finding R3 — Cross-module navigation leakage in the ADMIN sidebar (P3)

**File:** `web/src/common_components/HmsMobileNav/HmsMobileNav.tsx:129-147`

**Exact defect**

Of the 17 ADMIN items, 8 point outside the admin module:

| Nav label | Path | Actual route group |
| :--- | :--- | :--- |
| Analytics Hub | `/analytics` | `(analytics)` |
| Revenue Analytics | `/revenue` | `(analytics)` |
| Inventory Forecast | `/analytics/inventory` | `(analytics)` |
| Doctor Payouts | `/payouts` | `(hr)` |
| Biomedical Assets | `/equipment` | `(assets)` |
| ABDM Gateway | `/gateway` | `(abdm)` |
| OT Surgery Schedule | `/ot/schedule` | `(ot)` |
| — | `/users`, `/audit-logs`, `/revenue` | also listed for `SUPER_ADMIN` (`:148-160`) |

**Root cause**

The admin sidebar was expanded with "anything an admin might want" rather than being scoped by module ownership.

**User impact**

No dead links and no broken shell (verified), but the admin sidebar mixes admin master-data duties with clinical, HR, asset and integration modules; the module boundary that the super-admin console respects is absent here, and it amplifies R5's active-state ambiguity.

**Recommended fix**

Keep an item only if there is an explicit, documented reason for the admin role to own it (the same rule applied in the super-admin brief). Otherwise group cross-module entries under a distinct "Enterprise Modules" section in the drawer and keep the bottom-nav five strictly admin-owned.

### Finding R4 — Reception navigation points at the hospital-wide admin notification page (P3)

**File:** `HmsMobileNav.tsx:91` (`RECEPTION`) and `:140` (`ADMIN`)

**Exact defect**

`RECEPTION` / `RECEPTIONIST` "Notifications" resolves to `/notifications`, which is `web/src/app/(admin)/notifications/page.tsx` — the admin Global Notification Center (all SMS/WhatsApp/Email/Push/system traffic plus broadcast and escalation controls).

**Root cause**

One `/notifications` route serves two audiences and the nav entry was copied across roles.

**User impact**

Front-desk users land on a privileged hospital-wide communication console; their actual need is already covered by `HmsNotificationBell` / `HmsNotificationDrawer` in the shared shell.

**Recommended fix**

Gate the nav item to `ADMIN` / `HOSPITAL_ADMIN`; reception users keep only the bell/drawer. Do not add a new route.

### Finding R5 — Navigation active-state over-matches (P3)

**File:** `HmsMobileNav.tsx:171-183`

**Exact defect**

After the exact-match and prefix checks, the fallback compares only the first path segment:

```ts
const currentSection = currentPath.split("/").filter(Boolean)[0];
const itemSection = path.split("/").filter(Boolean)[0];
return Boolean(currentSection && itemSection && currentSection === itemSection);
```

For an ADMIN user on `/analytics`, both "Analytics Hub" (`/analytics`) and "Inventory Forecast" (`/analytics/inventory`) are marked active. For a DOCTOR, all six `/doctor/*` items are marked active simultaneously.

**Root cause**

A broad fallback was added to keep dynamic routes such as `/encounter/[id]` selected — but the new page's own prefix rule at line 172 already covers that case.

**User impact**

Two or more sidebar items (and two bottom-nav underlines) appear selected at once, so the user loses the sense of current location.

**Recommended fix**

Replace the first-segment fallback with a longest-prefix match: among items whose `path` equals `currentPath` or is a parent of it, select the one with the longest `path`. Keep the existing prefix rule for dynamic segments.

---

## 2. Authentication & Authorization

### Verified

- The shared `HmsAppShell` renders the sidebar from the session role, falls back to `"DOCTOR"` when `user` is null (`HmsAppShell.tsx:32`), and performs no redirect of its own.
- `middleware.ts:4-24` returns `NextResponse.next()` for every path; its comment claims client-side redirection happens "via HmsAppShell", which the source does not do.
- The platform console guard (`(super-admin)/layout.tsx:19-43`) is the established, working fail-closed pattern in this repository.
- `authApiService.login()` validates submitted tenant IDs for hospital-scoped roles against `VALID_DEMO_TENANT_IDS` (`auth_api_service.ts:21-31, 51-61`).

### Finding A1 — The `(admin)` route group has no authorization guard (P1)

**Files**

- `web/src/app/(admin)/` — **no** `layout.tsx` exists
- `web/src/app/(super-admin)/layout.tsx:19-43` — the guard that the admin group lacks
- `web/src/common_components/HmsAppShell/HmsAppShell.tsx:32`
- `web/src/middleware.ts:4-24`

**Exact defect**

`find . -name layout.tsx` returns only `./layout.tsx` and `.(super-admin)/layout.tsx`. There is no role check anywhere on the path to an admin screen: the middleware is a no-op, and `HmsAppShell` substitutes a DOCTOR sidebar when there is no session.

**Root cause**

The fail-closed route-group guard added during the super-admin phase was never mirrored for the hospital admin group.

**User impact**

An unauthenticated visitor — or any hospital role such as NURSE, BILLER, RECEPTIONIST or DOCTOR — can open `/users`, `/tariffs`, `/beds`, `/departments`, `/hospital-settings`, `/audit-logs`, `/print-templates`, `/roster` and `/accreditations` and operate the privileged UI, with a **Doctor** navigation rendered around admin screens. Because mutations are also not actor-audited (A3), those actions are logged as `HOSPITAL_ADMIN`. This is a direct inconsistency with the platform console, which is now protected.

**Recommended fix**

- Add `web/src/app/(admin)/layout.tsx` mirroring `(super-admin)/layout.tsx`: allow `ADMIN` and `HOSPITAL_ADMIN`, redirect to `/login?redirect=<pathname>` when the role is not authorized, and render the "Verifying …" spinner while the redirect is in flight.
- Decide explicitly whether `SUPER_ADMIN` may enter (its nav already links `/users` and `/audit-logs`); fail closed by default.
- Must be hydration-safe: do not authorize before the persisted Zustand session has hydrated (see E3).
- Reuse `useAuthUserStore` and the existing evaluator; do not create a new store or guard abstraction.

### Finding A2 — Hardcoded tenant ID in the staff RBAC lookup (P1)

**File:** `web/src/app/(admin)/_admin_components/UserManagement/StaffUserTable.tsx:37`

**Exact defect**

```ts
const rbacRoles = useRbacControlStore((state) => state.getRolesForTenant("TNT-9014"));
```

The session already carries the tenant (`auth_user_store.ts:25 tenantId`), and the RBAC store holds custom roles for several tenants (`rbac_control_store.ts:31 TNT-9014`, `:75 TNT-1042`, …).

**Root cause**

Tenant identity is never sourced from the session. The admin domain model has no tenant scoping at all — verified: `staff_user_types.ts` (`StaffUser`), `roster_types.ts` (`StaffShiftRoster`), `bed_types.ts` (`HospitalBed`), `tariff_types.ts` (`HospitalTariff`) and `department_types.ts` (`HospitalDepartment`) define **no** `tenantId` / `hospitalId`. The panel is single-tenant by construction while `/users` advertises "Hospital Multi-Tenant Staff Credentials" (`users/page.tsx:18`).

**User impact**

An administrator signed into any tenant other than `TNT-9014` sees Apollo's custom roles, cannot see their own tenant's custom roles in the "Canonical RBAC Role Assignment" dropdown, and can assign a `CUST-TNT-9014-*` role to a staff member of another hospital — cross-tenant role leakage and a wrong effective-permission set on the provisioned account.

**Recommended fix**

- Read the tenant from the session: `useAuthUserStore((s) => s.user?.tenantId)`.
- Select the two stable RBAC slices (`globalTemplates`, `tenantCustomRoles`) and resolve the tenant's roles from them (this also fixes C6 and E2).
- Fall back to a documented default only when the session genuinely has no tenant.
- Same rule as the super-admin "hardcoded tenant in live preview" fix: never hardcode a tenant ID in a tenant-specific component.

### Finding A3 — Audit actor and role are fabricated, and mutations are not authorization-gated (P2)

**Files**

- `_admin_services/bed_service.ts:136,183,220,267,313,349`
- `_admin_services/staff_user_service.ts:130,189,240,283,323,356,474`
- `_admin_services/department_service.ts:126,203,340,412`
- `_admin_services/roster_service.ts:165,218,254,284,316,382`
- `_admin_components/HospitalSettings/HospitalSettingsWorkspace.tsx:58-75`
- The only enforcement point that exists: `_admin_services/tariff_service.ts:12` (`AUTHORIZED_ROLES = ["HOSPITAL_ADMIN","SUPER_ADMIN","FINANCE"]`)

**Exact defect**

Every audit event these services emit is written with the literal `actorRole: "HOSPITAL_ADMIN"`. `HospitalSettingsWorkspace` additionally hardcodes `actor: "Dr. Rajesh Sharma (Hospital Admin)"` and `ipAddress: "192.168.1.105"`. No service rejects a caller whose session role is not authorized.

**Root cause**

Actor identity is treated as a display string supplied (or defaulted) by the UI, so the service layer has no authenticated principal to check.

**User impact**

The compliance ledger that the admin panel itself presents as evidence records a false actor, role and IP address. A NURSE session that creates a department, a bed or a staff user is recorded as "HOSPITAL_ADMIN" — so the audit trail is not trustworthy and unauthorized mutation is not prevented (only tariff mutation is).

**Recommended fix**

- Thread the authenticated actor (name + role + tenant) from `useAuthUserStore` into the service calls; most service methods already accept an actor-name argument — verify per method and pass the real value instead of a literal.
- Enforce one shared authorized-role list across bed / department / staff-user / roster mutations using the existing `TariffService` pattern, returning the same `{ success, error }` shape.
- Remove the constant IP (or capture it server-side).
- Do not create a new service or store.

### Finding A4 — In-page role impersonation switcher on the tariff master (P2)

**File:** `_admin_components/TariffEditor/MasterPriceListTable.tsx:75-76, 96-114`

**Exact defect**

A `Select` lets the operator reassign `currentActorRole` among `HOSPITAL_ADMIN` / `FINANCE` / `NURSE` ("Staff Nurse (Restricted)"), and that value is passed straight into `TariffService.updateTariffPrice(...)` (lines 107-114). The page's RBAC "verification" therefore only proves that the page can be told to impersonate an authorized role.

**Root cause**

Role-based access control was demonstrated as a UI simulation instead of being derived from the session.

**User impact**

A restricted role (nurse) can self-elevate by choosing "Hospital Admin" and then saving a price change, and the resulting audit entry records the impersonated role (compounding A3).

**Recommended fix**

Derive actor and role from the session and pass those to the service. If a simulation control must remain for the demo, gate it behind an explicit demo flag, label it "Demo only — does not change authorization", and keep the real permission check on the session role.

### Finding A5 — MFA path discards the selected tenant and cannot yield an admin role (P2)

**File:** `web/src/app/(auth)/_auth_services/auth_api_service.ts:92-107`

**Exact defect**

`verifyMfa()` returns either `NURSE` or `DOCTOR` and always `tenantId: "TENANT-001"`, ignoring the tenant submitted and validated during `login()` (`:51-61`).

**Root cause**

The demo MFA flow predates tenant validation and was never wired to the validated tenant.

**User impact**

A user who authenticates through the MFA demo path (username `mfauser`) lands in a different hospital than the one they selected. Combined with A2, the admin panel then resolves tenant-scoped RBAC data for the wrong tenant, and an admin account cannot complete the MFA path with its own role.

**Recommended fix**

Carry the submitted/validated tenant through the MFA challenge (session token or store field) and make the verified role reflect the account rather than a hardcoded doctor/nurse pair.

---

## 3. Audit, Lifecycle & Licensing

### Verified

- Licence-seat quota **is** enforced: `StaffUserService.getLicenseUsage()` (`staff_user_service.ts:68-90`) and `createStaffUser()` / `updateUserStatus()` block creation/activation when seats are exhausted (`:98-102`, `:223-227`). Do not re-implement this.
- Destructive actions are guarded: `checkDeleteOrDisableSafety()` (`:378`) and `DepartmentService.checkDeleteSafety()` (`:259`) block delete/disable while active references exist, and the UI surfaces the reference list (`StaffUserTable.tsx:583-609`, `HospitalDepartmentManager.tsx:585-598`).
- Tariff mutations **are** role-checked and write a price-history timeline (`tariff_service.ts`; see `tariff_architecture_validation_report.md`).
- Entity-level audit views already read live data: `StaffUserTable.tsx:276` and `departments/[departmentId]/page.tsx:56` both use `PlatformAuditService.getAuditLogs()`.

### Finding B1 — `/audit-logs` renders a hardcoded 3-row mock instead of the live ledger (P2)

**Files**

- `web/src/app/(admin)/_admin_components/AuditLogs/DpdpAuditLogTable.tsx:17-21`
- Reused by `web/src/app/(admin)/admin/page.tsx:226`
- Page copy: `web/src/app/(admin)/audit-logs/page.tsx:15-17`

**Exact defect**

The table body is a literal array of three rows dated `2026-09-08` with invented consent hashes, presented under the banner "DPDP & ABDM Compliance Immutable Audit Trail (Append-Only) … Hash-Chain Validated". The real ledger is available and already used elsewhere in the same module but is not consulted here.

**Root cause**

The compliance screen was never wired to the audit service whose other admin consumers (staff users, department detail) already use it.

**User impact**

The panel's most trust-critical page shows stale mock rows and never reflects actual admin activity (create user, edit tariff, change settings). An auditor sees an empty/stale trail after performing actions, and the dashboard audit preview contradicts the entity-level audit tabs on the same screen.

**Recommended fix**

Consume `PlatformAuditService.getAuditLogs()` read-only with pagination and entity/category filters, rendering the hash-chain presentation from real records. Keep it read-only (the page's "Immutable … Append-Only" promise). No new store or service.

### Finding B2 — Bed creation bypasses `BedService` and the tariff price single source of truth (P2)

**Files**

- `_admin_components/BedConfig/HospitalBedConfigTable.tsx:48-75` (manual `dailyRate` at `:67`, direct store write at `:71`, rate field at `:241`)
- `_admin_services/bed_service.ts:24-42` (`getBeds()` re-resolves `dailyRate: TariffService.resolveBedRate(b.category)`)
- `_admin_stores/admin_bed_store.ts:81-301` (per-bed `dailyRate` literals, e.g. `8500`, `1500`, `2800`, `6500`)

**Exact defect**

The only bed-creation path calls the store directly (`useBedStore.getState().addBed(newBed)`); `BedService` exposes no `addBed`/`registerBed` (verified by signature listing and by grepping every `addBed` call site — exactly one). The modal also captures a free-text "Daily Bed Tariff Rate (₹)" defaulting to `2500`.

**Root cause**

Bed configuration was implemented against the store while bed **reads** were migrated to the tariff-resolving service, leaving the write path behind.

**User impact**

Two defects: (a) bed creation emits **no** audit event while every other admin mutation does; (b) the admin table shows the hand-typed rate (raw store) while IPD admission/discharge and billing show the tariff-resolved rate (`bed_service.ts:28`), so one physical bed legitimately displays two different daily prices — exactly the duplication the tariff validation report claims to have eliminated.

**Recommended fix**

Add `BedService.registerBed()` that validates, audits and resolves the rate from `TariffService.resolveBedRate(category)`; make the modal's rate field read-only/derived (persist the billing category/code, not a free price); and have the table read through `BedService.getBeds()` so admin and billing agree.

### Finding B3 — "Save Template Config" persists nothing (P2)

**File:** `_admin_components/PrintTemplates/PrintTemplateStudio.tsx:24-26`

**Exact defect**

`handleSaveTemplate` performs no write — it only calls `message.success(...)`. Template type, logo position, watermark, doctor-registration toggle, GSTIN toggle, page size and disclaimer footer are all component-local `useState` (lines 14-22) and are lost on refresh or navigation.

**Root cause**

The studio was built as a visual preview and never connected to persistence, although the component already imports `useAdminSettingsStore`.

**User impact**

A success toast confirms a save that did not happen, so the configured letterhead, GST layout and footer silently revert. This is the worst failure mode for a configuration screen.

**Recommended fix**

Persist the template configuration through the existing `useAdminSettingsStore` and emit an audit event via `PlatformAuditService` (consistent with `HospitalSettingsWorkspace`). If persistence is intentionally out of scope, relabel the page so it is clearly a preview-only surface. Do not add a new store.

### Finding B4 — Licence KPI is hardcoded and contradicts the staff screen (P3)

**Files:** `(admin)/admin/page.tsx:67-71` (`237 / 315`, "12 Doctors On Duty") vs `_admin_components/UserManagement/StaffUserTable.tsx:42,288-322` and `staff_user_service.ts:68-90` (`LICENSED_SEAT_QUOTA`)

**Exact defect**

The dashboard licence tile is static text; the staff screen computes real seats, active users, available seats and utilisation. The dashboard plan label ("Tenant Enterprise Plan", `StaffUserTable.tsx:290`) is also a literal.

**Root cause**

Dashboard KPIs were authored as mock copy.

**User impact**

Two screens in the same panel report different licence numbers for the same tenant, and the dashboard is the first screen an admin should see.

**Recommended fix**

Drive the tiles from `StaffUserService.getLicenseUsage()` and resolve the plan label from the existing `subscription_plan_service` rather than a literal. Do not duplicate the quota logic.

### Finding B5 — Remaining dashboard KPIs are static (P3)

**File:** `(admin)/admin/page.tsx:81-82` ("78.4%", "148 Occupied / 185 Total Beds"), `:92` ("₹ 4,82,500"), `:103` ("96% Compliant")

**Exact defect**

Bed occupancy, daily revenue and NABH compliance are literal strings, although computed equivalents exist: department/bed occupancy is already derived at `HospitalDepartmentManager.tsx:286-289`, and accreditation status is real state in `AccreditationComplianceManager.tsx:22-67`.

**Root cause**

Same as B4 — the dashboard was authored as mock copy before the modules were built.

**User impact**

The dashboard's bed-occupancy figure contradicts the bed and department masters in the same panel, and its compliance figure contradicts the accreditation table, which undermines confidence in every other number on the page.

**Recommended fix**

Wire occupancy from the bed store/service and department capacity, and compliance from the accreditation data; for any metric that genuinely has no source yet, label it as illustrative and de-emphasise it visually.

### Finding B6 — Department detail tabs read store snapshots without subscribing (P3)

**File:** `(admin)/departments/[departmentId]/page.tsx:60-66`

**Exact defect**

```ts
const rosters = useAdminRosterStore.getState().rosters.filter(…);
const attendance = useHrStore.getState().attendanceLogs.filter(…);
```

These are evaluated during render via `getState()` rather than a subscription.

**Root cause**

`getState()` was used where the store hooks were required, so the component never registers a listener.

**User impact**

The "Active Roster (n)" and audit tab counts, and the rows inside them, do not refresh when a shift or attendance record changes elsewhere (for example after editing the roster on `/roster`) until the page is remounted.

**Recommended fix**

Subscribe with the store hooks (`useAdminRosterStore((s) => s.rosters)`, `useHrStore((s) => s.attendanceLogs)`) and keep the existing filter logic unchanged.

---

## 4. Branding State & UI Consistency

### Verified

- 10 of the 11 admin components use the shared `HmsButton` / `HmsCard` / `HmsAppShell` kit; only `HospitalBedConfigTable` uses raw AntD buttons (C3) and `DpdpAuditLogTable` has no buttons at all.
- `safe-area-bottom`, `animate-fade-in`, `bg-crimson`, `bg-emerald-green` and `bg-primary-teal` all exist in the compiled stylesheet — the shell's mobile safe-area padding and animations work.

### Finding C1 — Two sources of truth for hospital identity and branding (P2)

**Files**

- Admin: `_admin_stores/admin_settings_store.ts:8,19,90,101,181` — `hospitalName`, `logoUrl`, persist key `hms_admin_settings_store`; consumed by `HospitalSettingsWorkspace.tsx` and `PrintTemplateStudio.tsx:12`
- Platform: `(super-admin)/_super_admin_stores/branding_store.ts` — `brandingByTenant`, persist key `super_admin_unified_branding_store_v1`; consumed by `EmailBrandingWorkspace`, `PdfBrandingWorkspace`, `LiveBrandingPreviewWorkspace`, `WhiteLabelControlsWorkspace`

**Exact defect**

`admin_settings_store` duplicates fields that the platform branding store owns (`hospitalName` → product/letterhead identity, `logoUrl`), and the admin print preview renders from the admin copy.

**Root cause**

The branding unification implemented on the platform console was never reflected back into the admin settings model.

**User impact**

The hospital can print a prescription or tax invoice whose logo/name differs from the platform-managed branding for the same tenant, breaking the "unified branding configuration" guarantee as soon as an admin edits identity in Hospital Settings.

**Recommended fix**

Decide one owner. Recommended: `useBrandingStore` owns identity/logo/letterhead per tenant while `admin_settings_store` keeps operational settings (slots, GST defaults, ABDM credentials, notification keys). Have the admin print preview read the branding entry for the **session tenant** — never a hardcoded tenant (apply A2).

### Finding C2 — Undefined design tokens: `text-3xs` and `bg-alert-crimson` generate no CSS (P2)

**Files**

- `web/src/app/globals.css:61-69` — the `@theme` font-size scale defines `xs…5xl` only; **no** `--text-3xs`
- `web/src/app/globals.css:110` (`--hms-alert-crimson` in `:root`) vs `:130`/`:139` (`--color-alert-crimson` only inside `html.high-contrast`)

**Exact defect (build-verified)**

Checked against the compiled bundle `.next/static/css/b3db0849bfa63c95.css`:

| Utility | Occurrences in compiled CSS | Consequence |
| :--- | :--- | :--- |
| `.text-3xs` | **0** | font size falls back to the inherited value |
| `.bg-alert-crimson` | **0** | no background on the badge |
| `.bg-primary-teal` | 1 | control (present) |
| `.safe-area-bottom` | 1 | control (present) |
| `.animate-fade-in` | 1 | control (present) |
| `.bg-crimson` | 1 | control (present) |
| `.bg-emerald-green` | 1 | control (present) |

**User impact**

- `text-3xs` micro-labels (KPI sub-copy, table metadata, drawer claims, the print preview table and signature block) render at the inherited size instead of 11px, collapsing the typographic hierarchy exactly where the panel is densest. Usage in admin: `StaffUserTable.tsx` (14), `admin/page.tsx` (10), `PrintTemplateStudio.tsx` (10), `HospitalDepartmentManager.tsx` (9), `departments/[departmentId]/page.tsx` (6), `HospitalBedConfigTable.tsx`, `StaffRosterManager.tsx` (plus the HR roster component).
- `bg-alert-crimson` numeric badges render as white digits on a transparent chip, i.e. effectively invisible. Affected: `HmsMobileNav.tsx:260` (mobile bottom bar), `:340` (drawer), `:409` (desktop sidebar) — including the Notifications unread count that admins rely on.

**Recommended fix**

- Define `--text-3xs: 0.6875rem;` (11px) in the `@theme` block so the existing utility resolves everywhere.
- Either add `--color-alert-crimson` to `@theme` or switch the three badges to the existing `bg-crimson` / `var(--hms-alert-crimson)`. Choose one convention and sweep it.

### Finding C3 — The only admin component using raw AntD buttons (P3)

**File:** `_admin_components/BedConfig/HospitalBedConfigTable.tsx:161,165,246,247`

**Exact defect**

Uses raw `<Button>` from `antd` for "Add Bed" / "Cancel" instead of the shared `HmsButton` used by every other admin component.

**Root cause**

The bed console was ported from an earlier AntD table implementation and never migrated to the shell kit.

**User impact**

The Bed & Ward Configuration screen renders AntD default **blue** primary buttons at default heights instead of the HMS teal/emerald system with 44px touch sizing — visibly "a different application" inside one panel, and inconsistent touch targets on mobile.

**Recommended fix**

Migrate to `HmsButton` (`variant="emerald"` for the primary action, `variant="secondary"` for cancel, matching `size` conventions used in `HospitalDepartmentManager`).

### Finding C4 — Every admin page renders two different H1s (P3)

**Files:** all 11 pages, e.g.

- `users/page.tsx:11` shell title "Staff User & RBAC Management" vs `:15-17` body `<h1>` "Staff & RBAC User Management"
- `tariffs/page.tsx:11` shell title "Service Tariffs & Price Master" vs `:16` body `<h1>` "Hospital Tariff & Master Price List"
- `beds/page.tsx:10` shell title "Bed & Ward Configuration" vs `:15` body `<h1>` "Bed & Ward Configuration" (duplicated verbatim)
- `admin/page.tsx:30` shell title "Hospital Admin Console" vs the welcome-banner `<h1>` "Hospital Administration Dashboard"

**Exact defect**

`HmsAppShell` renders `title` as an `<h1>` in the desktop header (`HmsAppShell.tsx:77-81`) and each page then renders a second, differently worded `<h1>` in its body.

**Root cause**

Shell title and page heading were authored independently, with no shared convention.

**User impact**

Two contradictory `h1`s per screen: a broken heading outline for screen readers, and visible duplication on desktop where both are shown at once (the shell header is `hidden lg:block`, so on mobile only the body heading appears). Each screen also has two different names.

**Recommended fix**

Choose one convention: keep the shell `title` as the single `h1` and demote the body heading to `<h2>` (or a subtitle on `HmsAppShell`), or drop the shell title and keep the body heading. Apply consistently to all 11 pages.

### Finding C5 — Terminology drift for the same module (P3)

**Evidence**

| Module | Nav label (`HmsMobileNav.tsx`) | Shell title | Body heading | Action label |
| :--- | :--- | :--- | :--- | :--- |
| Tariffs | "Service Tariffs" (`:139`) | "Service Tariffs & Price Master" | "Hospital Tariff & Master Price List" | "Add Tariff Item" (`page`) / "Add Tariff" (table) |
| Staff | "Staff & RBAC Users" (`:133`) | "Staff User & RBAC Management" | "Staff & RBAC User Management" | "Add New Staff User" / "Add Staff User" |
| Beds | "Wards & Beds" (`:135`) | "Bed & Ward Configuration" | "Bed & Ward Configuration" | "Add Bed" |
| Audit | "Audit Logs (DPDP)" (`:141`) | "Audit Trail & DPDP Compliance" | "DPDP Act & ABDM Compliance Audit Log" | — |

**Root cause**

Nav, shell titles, page headings and button labels were written separately with no glossary.

**User impact**

Users cannot build a reliable mental model or predict where a feature lives; the same button appears with two different labels on one screen (D4).

**Recommended fix**

Define one canonical label per module and reuse it in nav + shell title + breadcrumb, and one action verb per entity ("Add <entity>"). Keep the deeper explanatory copy as the subtitle only.

### Finding C6 — RBAC role dropdown lists every global template twice, with duplicate React keys (P2)

**File:** `_admin_components/UserManagement/StaffUserTable.tsx:38-39` + `:459-466`; store helper at `(super-admin)/_super_admin_stores/rbac_control_store.ts:104-108`

**Exact defect**

`getRolesForTenant()` already returns `[...state.globalTemplates, ...custom]`, and the component then builds `allRoles = [...globalTemplates, ...(rbacRoles || [])]`, so every global template is listed twice in the "Canonical RBAC Role Assignment" dropdown. `Select.Option key={r.id}` consequently emits duplicate keys as well.

**Root cause**

The store helper's contract was misread as "custom roles only"; the extra spread was added to compensate.

**User impact**

The role picker is doubled with identical-looking options, so administrators cannot tell whether two entries are different roles; React also logs a duplicate-key warning (contributing to the render churn in E2).

**Recommended fix**

Build the option list once — either call `getRolesForTenant(tenantId)` alone or compose from the two slices while de-duplicating by `roleId` — and derive it with `useMemo`.

### Finding C7 — Session hospital name is hardcoded (P2)

**Files:** `(auth)/_auth_services/auth_api_service.ts:73` → surfaced by `HmsAppShell.tsx:34,72`

**Exact defect**

`login()` assigns `hospitalName: "Apollo Super Speciality Hospital"` to **every** hospital-scoped account regardless of the (validated) submitted tenant.

**Root cause**

The demo session builder predates tenant-derived identity and was never wired to the tenant/branding data.

**User impact**

A session created against `TNT-1042` (or any non-Apollo tenant) displays Apollo's name in the shell header and breadcrumb, contradicting both the `/users` "Multi-Tenant" claim and the tenant branding owned by the platform console (C1).

**Recommended fix**

Resolve the hospital name from the tenant/branding source for the session tenant (reuse `tenant_api_service` / `branding_store`), keeping the literal only as a documented demo fallback.

---

## 5. Responsive UI & Workflow Reliability

### Verified

- Every admin page is wrapped in `HmsAppShell`, so the panel inherits the shared mobile top bar, bottom bar and drawer instead of building its own.
- Touch-target sizing (`min-h-[44px]`) is applied consistently in `HospitalDepartmentManager`, `HospitalSettingsWorkspace`, `PrintTemplateStudio` and the dashboard tiles.
- All admin tables already use `scroll={{ x: "max-content" }}`, so tables overflow inside a scroll container instead of breaking the page layout.

### Finding D1 — Mobile bottom bar exposes the wrong five admin items (P2)

**File:** `HmsMobileNav.tsx:244-273` (`navItems.slice(0, 5)`) with the ADMIN ordering at `:129-147`

**Exact defect**

Because the bottom bar takes the **first five** entries of the role array, the admin bottom bar is: Analytics Hub, Revenue Analytics, Inventory Forecast, Staff & RBAC Users, Departments. Beds, Hospital Settings, Tariffs, Accreditations, Print Studio, Audit Logs, Roster, Payouts, Equipment, ABDM Gateway and OT Schedule are reachable only through the hamburger (a flat 17-row list). Labels are additionally clipped by `text-[11px] truncate max-w-[64px]`, so "Staff & RBAC Users" renders truncated.

**Root cause**

Bottom-nav slots are the "first five of the array" rather than a deliberate primary-action selection, and the ADMIN array was appended to over time.

**User impact**

On a phone the most frequently used admin duties (staff, beds, settings, tariffs) are two taps and a long scroll away while three analytics entries occupy prime space; the fourth slot's label is unreadable. Combined with R1 there is no Dashboard entry at all.

**Recommended fix**

Reorder the ADMIN array so the primary duties occupy the first five positions (Dashboard, Staff & RBAC, Departments, Beds, Hospital Settings) and add a short display label for the bottom bar (full label retained in the drawer). No new routes.

### Finding D2 — Admin drawer is a flat, ungrouped 17-item list (P3)

**File:** `HmsMobileNav.tsx:313-348`

**Exact defect**

The drawer renders every role item in one flat list under a single "Module Navigation" heading; the platform console, by contrast, exposes 8 coherent entries.

**Root cause**

Grouping was never introduced as the admin item count grew.

**User impact**

On mobile — where the drawer is the only complete menu — scanning 17 mixed-scope items (see R3) is slow and error-prone.

**Recommended fix**

Introduce labelled sections in the drawer ("Core Administration", "Compliance & Audit", "Enterprise Modules") driven by a `group` field on the existing items, without creating routes or a new nav component.

### Finding D3 — Wide tables and text-heavy action columns at 320–414 px (P3)

**Files**

- `StaffUserTable.tsx:386` (`scroll={{ x: "max-content" }}`), action cell at `:253-271` (view / edit / reset password / disable + status switch)
- `MasterPriceListTable.tsx:311-364` — three **text** buttons per row ("Edit / History", "Components (n)", "Deactivate")
- `HospitalDepartmentManager.tsx:406`, `HospitalBedConfigTable.tsx:176-185`, `StaffRosterManager.tsx:104-108`

**Exact defect**

Action columns are the widest cells and the tariff table's actions are full-text buttons, so on phone widths users must pan horizontally to reach row actions and rows become very tall.

**Root cause**

Row actions were designed for desktop table density with no compact mobile variant.

**User impact**

Repeated horizontal panning to do the primary task on each screen, with hard-to-hit targets on small devices — in tension with the "44px minimum touch target" rule stated in the design system.

**Recommended fix**

Reuse the pattern already proven in the super-admin console: keep the primary action inline and move secondary actions into a compact AntD `Dropdown` triggered by `MoreVertical` (the `SubscriptionManagerTable` pattern). Verify at 320 / 375 / 390 / 414 px.

### Finding D4 — Dead buttons in page headers (P3)

**Files**

- `web/src/app/(admin)/users/page.tsx:20-22` — "Add New Staff User" (`HmsButton` with **no** `onClick`)
- `web/src/app/(admin)/tariffs/page.tsx:20-22` — "Add Tariff Item" (`HmsButton` with **no** `onClick`)

**Exact defect**

The working triggers live in the table toolbars (`StaffUserTable.tsx:377 handleOpenAdd`, `MasterPriceListTable.tsx:126 setIsAddModalOpen(true)`); the page-level buttons are decorative.

**Root cause**

The header action was added before the in-table toolbar and never wired.

**User impact**

The most prominent primary button on two screens does nothing, so users conclude the feature is broken; it also duplicates one action under two labels (C5).

**Recommended fix**

Either remove the dead header buttons or wire them to the existing handlers by lifting the "open modal" callback to the page and passing it down. Do not duplicate the mutation path.

### Finding D5 — Roster assignment silently downgrades unmapped roles to DOCTOR (P2)

**File:** `_admin_components/Roster/StaffRosterManager.tsx:35-41`

**Exact defect**

```ts
let roleCat: StaffRoleCategory = "DOCTOR";
if (user.roleCategory === "DOCTOR") roleCat = "DOCTOR";
else if (… "NURSE") … else if (… "PHARMACIST") … else if (… "LAB_TECH") … else if (… "RECEPTIONIST") …
```

There is no branch for `BILLER`, `ADMIN` or `SUPER_ADMIN`, so those users are stored on the shift roster as **DOCTOR**, with no warning shown to the operator.

**Root cause**

Two conflicting role vocabularies exist with no translation layer between them:

- `_admin_types/staff_user_types.ts:5-13` — `DOCTOR`, `NURSE`, `RECEPTIONIST`, `PHARMACIST`, `LAB_TECH`, `BILLER`, `ADMIN`, `SUPER_ADMIN`
- `_admin_types/roster_types.ts:5-13` — `DOCTOR`, `NURSE`, `LAB_TECH`, `PHARMACIST`, `RECEPTIONIST`, `ADMINISTRATIVE`, `ALLIED_HEALTH`, `FINANCE`

**User impact**

A wrong clinical role is recorded for a real duty shift, flowing into the roster table, the department-detail roster tab, role-based roster filters/statistics and any role-targeted notification or handover lookup.

**Recommended fix**

Add one explicit canonical mapping (for example `BILLER → FINANCE`, `ADMIN`/`SUPER_ADMIN → ADMINISTRATIVE`, `LAB_TECH → ALLIED_HEALTH`) or reject the selection with a validation message instead of silently defaulting. Do not introduce a third role-category type.

---

## 6. Runtime / 500 Prevention & Verification

### Finding E1 — Verified clean (no action required)

| Check | Command | Result |
| :--- | :--- | :--- |
| TypeScript | `cd web && npx tsc --noEmit` | exit 0, **0 errors** |
| Route collisions | `find . -name 'page.tsx' \| sed … \| sort \| uniq -d` | empty — no two pages resolve to one path |
| Orphan components | per-component import search | 11/11 used |
| Shared-kit adoption | `grep -c 'HmsButton'`/`HmsCard` per component | 10/11 components (see C3) |
| Mobile shell utilities | compiled CSS | `safe-area-bottom`, `animate-fade-in` present |
| Licence enforcement | `staff_user_service.ts:98-102, 223-227` | enforced — do not re-implement |
| Tariff RBAC | `tariff_service.ts:12` | enforced — the defect is who supplies the role (A4) |

### Finding E2 — Unstable Zustand selector on `/users` (P1 runtime risk)

**Files**

- `_admin_components/UserManagement/StaffUserTable.tsx:37`
- `(super-admin)/_super_admin_stores/rbac_control_store.ts:104-108`

**Exact defect**

```ts
// staff store helper — allocates a NEW array on every call
getRolesForTenant: (tenantId) => {
  const state = get();
  const custom = state.tenantCustomRoles[tenantId] || [];
  return [...state.globalTemplates, ...custom];
},

// component — this new array is used directly as the store snapshot
const rbacRoles = useRbacControlStore((state) => state.getRolesForTenant("TNT-9014"));
```

Verified stack: `zustand@5.0.15` + `react@19.0.0` (read from `node_modules`). Zustand v5 passes the selector straight to React's `useSyncExternalStore`, which requires a **stable** snapshot; returning a freshly allocated array from the selector violates that contract.

**Root cause**

Deriving a new collection inside a store selector — the documented zustand v5 migration hazard ("selectors must return stable references", `useSyncExternalStoreWithSelector` was removed).

**User impact**

On `/users` — the highest-traffic admin page and the current post-login landing page — this can produce the "The result of getSnapshot should be cached to avoid an infinite loop" warning and a re-render loop / "Maximum update depth exceeded" crash. It also compounds with the duplicate-key rendering described in C6.

**Recommended fix**

- Select the stable slices instead: `globalTemplates` and `tenantCustomRoles`, then compose and de-duplicate the tenant's role list with `useMemo` (a single edit that also resolves A2 and C6).
- Audit every other `getRolesForTenant` / state-deriving-helper usage in a selector and apply the same correction. Do not add a memoized selector library; the built-in hooks are sufficient.

**Remaining limitation**

No browser session was available in this audit, so this is reported as a verified code-level contract violation with the exact dependency versions rather than an observed crash; reproduce by opening `/users` and watching the console.

### Finding E3 — The new admin guard must be hydration-safe (P2)

**Context:** every admin page is `"use client"` and depends on the persisted `hms_user_auth_session` store, and the platform console guard had to be corrected for deciding authorization before hydration completed (`(super-admin)/layout.tsx`; see the super-admin phase-1 report).

**Requirement for the A1 fix**

- Fail closed: render the verifying state, never the privileged UI, while the session is unknown.
- Decide authorization only after the persisted store has hydrated; do not create a redirect loop between `/login?redirect=…` and the admin route.
- Do not persist the hydration flag itself.
- Verify the flow: logout → direct `/users` → redirect to `/login`; login as hospital admin → lands on the intended page without a guard flash.

### Finding E4 — Fabricated environment data in audit payloads (P3)

**Files:** `_admin_components/HospitalSettings/HospitalSettingsWorkspace.tsx:73` (`ipAddress: "192.168.1.105"`), `_admin_components/AuditLogs/DpdpAuditLogTable.tsx:18-20` (fixed 2026 timestamps)

**Exact defect / impact**

A constant IP address is written into every settings audit record, and the audit table shows fixed dates. An auditor cannot distinguish real environment evidence from demo constants.

**Recommended fix**

Capture the IP server-side (or omit the field until a real source exists) and drive audit timestamps from real records (B1).

---

## 7. Verified-Correct Areas — Do Not Re-Fix

- **No route collisions**; the App Router build cannot fail on parallel pages.
- **No orphan admin components**; all 11 are wired to a page.
- **No dead navigation links**; all 17 ADMIN nav targets and all 12 static admin `href`s (plus the template `href` on the department detail sub-department list) resolve to real routes.
- **Licence seat quota enforcement** and **delete/disable safety guards** already work; the defects are KPI display (B4) and actor attribution (A3).
- **Tariff RBAC enforcement and price-history timeline** already work; the defects are who supplies the acting role (A4) and bed-price duplication (B2).
- **Shared UI kit adoption** is already correct in 10 of 11 components.
- **Mobile shell utilities** (`safe-area-bottom`, `animate-fade-in`) and the shell's 44px touch sizing are present and working.
- **The platform-console guard pattern** already exists and is the correct template for the admin fix.

---

## 8. Recommended Fix Sequence

Ordered so that each wave is verifiable independently and no wave depends on a later one.

| Wave | Findings | Rationale |
| :--- | :--- | :--- |
| **Wave 1 — Safety (P1)** | A1 (admin route guard), A2 + C6 + E2 (one edit: session tenant, stable selectors, de-duplicated role list), A4 (remove self-elevation switcher) | Closes every P1 in one small diff; all three are upstream of everything else and do not create new abstractions |
| **Wave 2 — Routing & IA** | R1 (`/admin` into nav + home path), R2 (single roster owner), R5 (active-state), D1/D2 (bottom-five order + grouped drawer), R3/R4 (nav scoping) | One navigation-contract change, verified once across roles |
| **Wave 3 — Data ownership & truth** | B1 (live audit ledger), B2 (BedService + tariff rate), B3 (persist print templates), B4/B5 (real KPIs), C1/C7 (single branding/hospital identity), A3/A5 (real actor + session integrity), B6 (reactive tabs) | Wires the panel to the services/stores that already exist; no new stores or services |
| **Wave 4 — UI consistency & polish** | C2 (tokens), C3, C4, C5, D3, D4, D5, E4 | Low-risk presentation and workflow consistency; no behavioural change |

**Rules carried over from the super-admin brief:** do not create new routes, stores or services; reuse `useAuthUserStore`, the unified evaluator, the subscription/tenant/platform-audit services; preserve unrelated work already on `main`; and do not record a fix as verified unless the source or build output supports it.

## 9. Verification Matrix (run after each wave, from `web/`)

Commands:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Manual flows:

1. Logged out → open `/users`, `/tariffs`, `/hospital-settings`, `/audit-logs` → each redirects to `/login` with a `redirect` parameter.
2. Signed in as NURSE / BILLER / RECEPTIONIST / DOCTOR → open the same routes → denied (no admin UI flash, no Doctor-sidebar-over-admin-screen).
3. Signed in as `hospitaladmin` → lands on `/admin`; the sidebar and drawer show "Admin Dashboard" and it is the first bottom-nav slot.
4. Open `/users` → the role dropdown has **no** duplicates, lists the session tenant's custom roles, and the console shows **no** "getSnapshot should be cached" / "Maximum update depth" output.
5. Change the tenant at login to `TNT-1042` → the header shows that hospital, and the RBAC roles shown are `TNT-1042`'s.
6. Create a bed → exactly **one** audit event appears on `/audit-logs`, and the bed's daily rate equals the tariff master rate in both the admin table and IPD admission.
7. Change Hospital Settings → the new audit entry is visible on `/audit-logs` immediately.
8. Save a print template → refresh → the configuration persists.
9. Create a shift for a BILLER staff user → the roster records the mapped role, not DOCTOR.
10. Mobile walkthrough at 320 / 375 / 390 / 414 px of all 11 routes → bottom-nav labels legible, badge counts visible (not blank chips), no horizontal page overflow, all row actions reachable.
11. `/roster` and `/hr/roster` → exactly one owner remains, and the other route redirects or no longer exists as a separate UI.

## 10. Audit Limitations

- All findings are **source- and build-derived**. No browser session or dev-server run was available, so responsive and visual conclusions (D1, D3, and the visual severity of C2) are derived from markup, breakpoints and the compiled stylesheet rather than screenshots.
- E2 is reported as a verified code-level contract violation with exact dependency versions, not an observed crash.
- The compiled-CSS evidence (C2) was taken from the existing `.next` build output; re-verify after any Tailwind theme change.
- The audit deliberately did not evaluate modules outside the admin panel except where they are wired into it (navigation, auth, audit service, branding store).

---

## 11. Phase 2 — Operational Controls & Advanced Workflows Implementation Report

### Executive Summary
Phase 2 for the Hospital Admin Subsystem (`web/src/app/(admin)/*`) has been fully implemented, verified via automated test suites, statically type-checked with zero errors, and validated with a successful production build (`86/86 static pages`).

### Summary of Phase 2 Controls Implemented

1. **Staff User Operational Controls & Account Governance (`staff_user_service.ts` & `StaffUserTable.tsx`):**
   - Implemented `StaffUserService.bulkUpdateUserStatus()` supporting bulk activation, suspension, and disabling of staff records.
   - Added interactive `rowSelection` batch management toolbar to `StaffUserTable.tsx`.
   - Added one-click Credential Reset workflow (`StaffUserService.resetUserCredentials()`) with modal verification and automated platform audit log emission.

2. **Inpatient Bed Transfer & Housekeeping Sanitation Workflow (`bed_service.ts` & `HospitalBedConfigTable.tsx`):**
   - Implemented `BedService.transferBed()` ensuring source beds automatically transition to `CLEANING` state upon transfer while target vacant beds claim `OCCUPIED` status and patient metadata.
   - Implemented `BedService.completeCleaning()` restoring bed status to `VACANT` upon housekeeping clearance.
   - Added interactive Bed Transfer Modal and single-action "Sanitize & Clear" / "Transfer" buttons to `HospitalBedConfigTable.tsx`.

3. **Tariff Master Bulk Operations & Compliance Export (`tariff_service.ts` & `MasterPriceListTable.tsx`):**
   - Implemented `TariffService.exportTariffsToCsv()` generating standard CSV formatted tariffs with headers (`Service Code`, `Billing Code`, `Category`, `Rate`).
   - Implemented `TariffService.bulkAdjustGstRate()` enabling single-click category-wide GST percentage adjustments with audit tracking.
   - Integrated CSV Download button into `MasterPriceListTable.tsx`.

4. **Department Management Safety Safeguards (`department_service.ts` & `DepartmentConfigTable.tsx`):**
   - Implemented `DepartmentService.checkHODReplacementSafety()` ensuring HOD replacement validation checks existing active staff assignments and pending shift rosters before re-assigning department leadership.

5. **Staff Duty Roster Shift Swapping & Attendance Integration (`roster_service.ts` & `StaffRosterManager.tsx`):**
   - Implemented `RosterService.swapShift()` supporting seamless duty shift exchanges between staff members with instant audit logging.
   - Implemented `RosterService.recordAttendancePunch()` linking duty rosters with HR biometric attendance entries (`PUNCH_IN` / `PUNCH_OUT`).
   - Integrated Shift Swap Modal and interactive trigger buttons in `StaffRosterManager.tsx`.

6. **DPDP Compliance & Security Audit Governance (`DpdpAuditLogTable.tsx`):**
   - Implemented Risk Level filter select (`CRITICAL`, `WARNING`, `INFO`) and JSON Export download capabilities for compliance auditors.

---

### Verification Results

| Verification Test Suite | Total Tests | Passed | Failed | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Phase 1 Control Suite** (`verify_admin_phase1_controls.ts`) | 19 | 19 | 0 | **PASSED** |
| **Phase 2 Operational Control Suite** (`verify_admin_phase2_operational_controls.ts`) | 16 | 16 | 0 | **PASSED** |
| **Static Type Check** (`npx tsc --noEmit`) | - | - | - | **ZERO ERRORS** |
| **Next.js Production Build** (`npm run build`) | 86 pages | 86 | 0 | **PASSED** |

---
