# Super Admin Panel — Phase 3 Code-by-Code Audit Report

## Audit scope
This audit was performed against the `main` branch of `infinityzeropawan/HMS`.

The review focused on the complete Super Admin route group under:
`web/src/app/(super-admin)/`

The audit included route files, Super Admin services, stores, hooks/types/schemas, and the interactive component groups. Files were reviewed sequentially with attention to imports, state flow, event handlers, route links, licensing/RBAC relationships, responsive behavior, and obvious runtime/data-consistency hazards.

## Verified findings and fixes

### 1. RBAC custom-role scope data was being discarded — FIXED
**File:** `web/src/app/(super-admin)/_super_admin_components/FacilityControl/RoleEditorModal.tsx`

**Defect:** The UI exposed scope selection, but `handleSave()` always wrote `allowedDepartments: ["ALL"]`.

That meant an existing role's department boundary could be lost when edited, and cloned roles could lose the parent's explicit department scope.

**Fix applied:** Added local `allowedDepartments` state, hydrated it from the role/parent template, reset it for new roles, and persisted it through `scopeRules`.

**Commit:** `46f7a43ab1760dff6d362812e1ad1774e23c772d`

---

### 2. Compliance dashboard showed total remediations while labeling the card "Open Remediations" — FIXED
**File:** `web/src/app/(super-admin)/_super_admin_components/FacilityControl/ComplianceScoringDashboard.tsx`

**Defect:** The page calculated an `openCount` for the remediation badge, but the overview card displayed `report.remediations.length`. That can include resolved/in-progress rows while the UI label says "Open Remediations".

**Fix applied:** The overview card now uses the same `status === "Open"` calculation as the tab badge and explicitly labels the value as open action items.

**Additional UX hardening:** The remediation table uses horizontal scrolling (`scroll={{ x: 980 }}`) so the dense column set remains usable on narrow screens.

---

### 3. Missing-plan guard was absent in feature subscription update path — FIXED
**File:** `web/src/app/(super-admin)/_super_admin_stores/feature_control_store.ts`

**Defect:** `updateTenantSubscriptionPlan()` could continue building a new assignment set even when `SubscriptionPlanService.getPlan(newPlan)` returned `undefined`.

**Fix applied:** The operation now exits safely when the requested plan definition cannot be resolved.

**Commit:** `79dead6f1f5c9791de5dc99ef6c803b05dda82bc`

## Important findings still present / tracked

### A. Super Admin tenant data layer is still in-memory/mock
**File:** `_super_admin_services/tenant_api_service.ts`

The service still contains mock tenant seed data and an in-memory repository/store. This is a production-readiness limitation, not a React rendering bug. The current frontend can therefore demonstrate lifecycle behavior without providing durable backend persistence across server restarts/devices.

**Status:** Tracked; not changed in this audit because replacing it requires a real backend/API contract rather than a safe local patch.

### B. Several domain services are intentionally demo/data-simulation services
Examples include compliance, consent, DPDP, retention and support stores/services with initial in-memory records. These are functional for frontend workflow demonstration but should not be presented as persistent production integrations until the backend boundary is connected.

**Status:** Tracked as architecture/data-source limitation.

### C. Existing phase reports contain claims that exceed what the current source alone proves
For example, the existing Phase 2 report claims executive analytics were dynamically linked from services, while the currently inspected `global-masters/page.tsx` is primarily a master-catalog page. The source/report wording should therefore be treated separately.

**Status:** Report accuracy issue; existing Phase 2 report was not rewritten to avoid erasing historical audit history.

## Structural checks performed

- Enumerated the Super Admin route group and component/service/type/store areas.
- Reviewed the key Super Admin pages and high-risk interactive components.
- Checked for obvious `TODO`/`FIXME`/debug-console patterns inside the Super Admin code search surface; no matching results were returned.
- Checked critical route/navigation links and interactive handlers in the reviewed files.
- Re-checked the latest source after each applied fix.

## Current verification status

Latest known Vercel status for commit `79dead6f1f5c9791de5dc99ef6c803b05dda82bc` was **PENDING** at the time this report was written. A successful Vercel deployment was previously confirmed for commit `5d4a32c73cb276dba540d7a583bd73f56c8f294d`.

The existing Phase 1/Phase 2 reports record successful TypeScript/build/test runs, but this Phase 3 review does not independently claim a fresh full browser E2E pass across every clickable control.

## Audit conclusion

The code review found concrete correctness issues and fixed them on `main`. The Super Admin source is materially hardened, but **"zero frontend bugs" cannot be certified solely from static source review and repository build/status metadata**. Remaining risk is concentrated in backend persistence/demo data boundaries and in the fact that exhaustive browser interaction testing is not independently evidenced by this code audit.
