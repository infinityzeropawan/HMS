# Super Admin Full Code Audit Report

## Audit date
2026-09-20

## Scope
This audit covers the complete Super Admin route group under `web/src/app/(super-admin)/`.

GitHub source-tree verification found **76 TypeScript/TSX source files** in the Super Admin route group, including pages, components, hooks, schemas, services, stores, tests, and type definitions.

The review was performed file-by-file with related imports/dependencies traced where a finding depended on another module. This was a source-code audit; it is not a substitute for browser/device E2E testing.

## Findings fixed in this audit

### 1. Compliance remediation KPI counted non-open items as open
**File:** `_super_admin_components/FacilityControl/ComplianceScoringDashboard.tsx`

**Issue:** The Overview card was labelled “Open Remediations” but displayed `report.remediations.length`, which included Resolved and In Progress records. The top navigation badge already used the correct status-filtered count, so the two UI values could disagree.

**Fix:** The card now counts only records whose status is `"Open"` and its supporting label explicitly says “Open action items in queue”.

### 2. Compliance sparkline was not safe for empty/one-point histories
**File:** `_super_admin_components/FacilityControl/ComplianceScoringDashboard.tsx`

**Issue:** The SVG sparkline divided by `values.length - 1` and dereferenced first/last points without guarding empty or single-point histories.

**Fix:** Empty histories return no sparkline; a single-point history renders a valid point marker; normal multi-point history remains unchanged.

### 3. Compliance remediation table could overflow small screens
**File:** `_super_admin_components/FacilityControl/ComplianceScoringDashboard.tsx`

**Issue:** The Ant Design table had no horizontal scroll contract even though the column set is wide.

**Fix:** Added `scroll={{ x: 980 }}` so the table remains usable on narrow/mobile layouts.

### 4. RBAC role scope was silently reset to ALL departments on save
**File:** `_super_admin_components/FacilityControl/RoleEditorModal.tsx`

**Issue:** Existing role scope such as Cardiology/CCU was loaded into the role model, but `handleSave()` always wrote `allowedDepartments: ["ALL"]`. Editing a role could therefore erase its existing department boundary.

**Fix:** Added `allowedDepartments` state, hydrate it from the edited role/parent template, preserve it when selecting a template, reset it only for a brand-new role, and persist it back through `scopeRules`.

**Remaining limitation:** The modal currently preserves the existing department list but does not provide a department-selector UI for creating a brand-new department-scoped role. That is a separate UX enhancement.

### 5. RBAC status changes were audited as role deletion
**File:** `_super_admin_stores/rbac_control_store.ts`

**Issue:** `toggleRoleStatus()` changed Active/Disabled status but emitted `ROLE_DELETED`.

**Fix:** The audit event is now `ROLE_UPDATED`, matching the actual operation.

### 6. Feature Assignment tenant selector was hard-coded and could drift from Tenant Management
**File:** `_super_admin_components/FacilityControl/TenantFeatureAssignmentGrid.tsx`

**Issue:** Feature licensing used a private `TENANT_OPTIONS` list while Tenant Management uses `TenantApiService`. Newly onboarded tenants could therefore exist in Tenant Management but be absent from Feature Assignment.

**Fix:** Tenant options are now loaded from `TenantApiService.fetchTenants()`, with loading/error handling and fallback selection when the current tenant is unavailable.

## Important remaining architectural finding

### Mock/in-memory repository boundary
**Primary file:** `_super_admin_services/tenant_api_service.ts`

The service declares an `ITenantRepository` abstraction, but the current implementation is still an in-memory static store initialized from `MOCK_TENANTS`. Tenant updates, suspensions, restores, onboarding additions, health telemetry, and audit-log data therefore do not represent durable backend persistence.

Related Super Admin services/stores also contain in-memory/demo state (subscription plans, feature-control state, support/compliance/governance records, and persisted browser Zustand state).

**Classification:** production-readiness / backend-integration gap, not a safe frontend-only fix. The correct next step is wiring the existing repository/service contracts to the real HMS backend and database rather than replacing the mock data with another frontend-only store.

## Additional source findings recorded

### Global Masters report/source mismatch
`global-masters/page.tsx` currently renders master catalogs (Drug, ICD-10, SNOMED-CT, LOINC). Earlier Phase-2 report wording describing executive analytics in this page does not match the current source implementation. This is a documentation consistency issue.

### Export/audit data remains demo-oriented
Several audit/telemetry exporters generate synthetic or in-memory records and use browser-side generated IDs. These should remain clearly classified as demo data until a persistent backend audit ledger is connected.

## Verified related controls

The audit also rechecked the existing Phase-1/Phase-2 control layer around:
- Super Admin hydration/authorization guard
- canonical feature ID mapping and aliases
- fail-closed feature evaluation
- PACS canonical mapping
- staff/RBAC feature mapping
- tenant lifecycle governance events
- subscription/feature consistency
- service dependency cycle checks
- existing Super Admin verification scripts

No regression was observed in those source-level controls during this review.

## Verification status

### Source-tree coverage
- 76 TypeScript/TSX files found under the Super Admin route group.
- Pages, components, hooks, schemas, services, stores, tests, and types included in the audit scope.

### Directly verified after fixes
- `RoleEditorModal.tsx`: scope departments are preserved and saved.
- `ComplianceScoringDashboard.tsx`: open KPI is status-filtered; sparkline has empty/single-value guards; remediation table has mobile scroll.
- `rbac_control_store.ts`: role status changes no longer emit `ROLE_DELETED`.
- `TenantFeatureAssignmentGrid.tsx`: tenant selector is sourced from Tenant Management.

### CI/deployment
The prior audited commit had a successful Vercel check. These new audit commits should be validated by the repository's normal CI/Vercel pipeline after GitHub processes them.

### Browser QA limitation
This audit did not independently execute every click/route at 320/375/390/414/1280px in a browser. Therefore this report does **not** claim that every possible runtime/browser bug has been eliminated.

## Change commits
- `46f7a43ab1760dff6d362812e1ad1774e23c772d` — preserve RBAC role scope departments
- `6ff868a45fba3fc2a755fd704584b4b98670b027` — harden compliance dashboard counts/mobile behavior
- `3ba686e27bd7aabffd1b5adc90fc0d26589da45b` — classify RBAC status changes correctly
- `96489e8a18108f3a517549a73c492b82fa8833b0` — source feature tenants from Tenant Management

## Final assessment
The audit found and fixed several concrete Super Admin frontend correctness/responsiveness issues. The remaining major gap is architectural: the Super Admin domain is still powered by mock/in-memory repositories in multiple places, so production-grade persistence and real backend integration are not yet established.

For the frontend itself, the repaired paths are source-verified, but full browser E2E coverage is still required before making a “zero runtime bugs” claim.
