# Super Admin Phase 1 — Deep Audit & Fix Brief

## 1. Routing & Navigation
### Verified
- The Super Admin route group currently exposes these primary routes:
  - /tenants
  - /subscription-plans
  - /feature-flags
  - /role-templates
  - /compliance-governance
  - /global-masters
  - /platform-audit
  - /support-tickets
- The shared HmsMobileNav also exposes additional Super Admin entries for /users, /audit-logs and /revenue. These are hospital-scoped routes and must be deliberately verified for Super Admin scope, not assumed safe because they are reachable.
- HmsAppShell is shared by Super Admin and hospital roles. It falls back to DOCTOR navigation when the user is null, so privileged layouts must finish authorization before rendering it.

### Required fix / verification
- Verify every Super Admin navigation target resolves to a real route on the current main branch.
- Verify nested tenant route /tenants/[tenantId] navigation and back-navigation.
- Verify mobile and desktop nav use the same authoritative route list.
- Do not create duplicate route trees.
- Any hospital-scoped route exposed to SUPER_ADMIN must have an explicit, tested reason for being accessible.

## 2. Authentication & Authorization
### Verified
- Super Admin login is the shared /login page.
- Demo authentication currently lives in client code in auth_api_service.ts.
- The submitted tenantId is copied directly into the returned session for every demo account.
- There is no tenant-existence validation in login().
- SUPER_ADMIN is currently assigned the submitted tenantId even though this is a platform-level role.
- MFA demo verification always returns a DOCTOR session.
- The Super Admin route guard previously made an authorization decision before Zustand persistence hydration; our chatgpt branch contains a hydration fix, but main must be rechecked after Antigravity changes.

### Required fix
- Keep the demo auth architecture for the demo, but validate tenant IDs against the canonical tenant service for hospital-scoped users.
- Treat SUPER_ADMIN as platform-scoped in the session model; do not silently trust an arbitrary submitted tenant.
- Make MFA role-aware or explicitly mark the demo MFA flow as non-Super-Admin.
- Route guards must fail closed.
- Do not persist the hydration status itself.
- Verify stale/invalid persisted sessions do not enter Super Admin screens.

## 3. Audit, Lifecycle & Licensing
### Finding A — Tenant lifecycle audit gap (P1)
File: web/src/app/(super-admin)/_super_admin_services/tenant_api_service.ts
- suspendTenant() and restoreTenant() mutate tenant state but do not dispatch the lifecycle event to PlatformAuditService / GovernanceEventBus.
- The report from Antigravity called this out; source inspection confirms the methods do not call PlatformAuditService at all.
Fix:
- Emit the canonical tenant suspend/restore governance/audit event through the existing centralized event mechanism.
- Use the authenticated actor rather than hardcoded identity where the architecture permits.
- Verify Platform Audit receives exactly one event per lifecycle action.

### Finding B — Fail-open authz bugs
File: web/src/app/(super-admin)/_super_admin_services/unified_auth_evaluator.ts
- Unknown tenants were previously treated as Active.
- Missing tenant subscriptions were previously able to fall back to Enterprise.
- Department-scoped roles could pass when departmentId was omitted.
These fixes are already present on the chatgpt branch and should be preserved when main is reconciled.

### Finding C — License feature-ID normalization (P2)
- Permission claims use IDs such as FEAT-CLIN-OPD while plan definitions use other feature-key forms.
- FEATURE_ID_ALIAS_MAP is an adapter, not a single canonical source.
Fix:
- Establish one canonical feature catalog identifier and normalize claims/plans/catalog/evaluator around it.
- Preserve existing public IDs only through an explicit compatibility map.
- Add tests for included, restricted and optional add-on cases.

## 4. Branding State & UI Consistency
### Finding A — Hardcoded tenant in live preview (P1)
File: web/src/app/(super-admin)/_super_admin_components/FacilityControl/LiveBrandingPreviewWorkspace.tsx
Verified source contains:
  const storeBranding = useBrandingStore((state) => state.brandingByTenant["TNT-9014"]);
This means the live preview reads Apollo/TNT-9014 branding even when another tenant is being previewed.
Fix:
- Pass tenantId into LiveBrandingPreviewWorkspace.
- Read brandingByTenant[tenantId].
- Never hardcode a tenant ID in a tenant-specific preview component.

### Finding B — Branding persistence key collision
File: web/src/app/(super-admin)/_super_admin_stores/branding_store.ts
- Zustand persist uses one global storage key: super_admin_unified_branding_store_v1.
- The actual state shape is brandingByTenant, which is tenant-keyed, so the single storage key is not inherently a collision by itself.
- The stronger verified defect is the hardcoded TNT-9014 read in the preview component.
Fix / verification:
- Keep one store if brandingByTenant remains the authoritative tenant-keyed state.
- Do not invent one-storage-key-per-tenant unless required.
- Ensure tenant switching always reads the selected tenant entry and never carries UI state from another tenant.

### Finding C — Type report false positive
- TenantBrandingConfig already contains emailBranding, pdfBranding and whiteLabel.
- ExtendedTenantBrandingConfig duplicates/strengthens the same shape.
Do not blindly merge interfaces. First remove duplicate type definitions only if the resulting imports remain type-safe.

## 5. Responsive UI & Workflow Reliability
### Finding A — Antigravity mobile table report is stale
File: SubscriptionManagerTable.tsx
- The Actions column is already a compact Ant Design Dropdown with a MoreVertical trigger.
- The table already has scroll={{ x: 1500 }}.
Therefore the report's specific claim that the action buttons are all rendered directly in the cell is stale.
Still verify:
- fixed-right action column visibility on 320–414px screens
- horizontal table usability
- filter toolbar wrapping
- modal widths on mobile

### Finding B — Suspend modal report is stale
File: SuspendTenantModal.tsx
- handleExecuteSuspend() already uses finally to clear submitting.
Do not apply the proposed finally fix again.
Still verify parent callback exceptions and duplicate submission behavior.

### Required deep UI pass
Check Super Admin pages at 320px, 375px, 390px, 414px and desktop:
- /tenants
- /subscription-plans
- /feature-flags
- /role-templates
- /compliance-governance
- /global-masters
- /platform-audit
- /support-tickets
Focus on:
- cards
- tables
- AntD modals/drawers
- filter bars
- tabs/segmented controls
- action buttons
- sticky/fixed elements
- horizontal overflow
- touch target size

## 6. Runtime / 500 Prevention & Verification
### Verified risk areas
- Large client-side service modules use module-level mutable mock stores.
- Tenant details and audit methods use generated/mock timestamps and IDs.
- Super Admin pages are client components and depend on browser state.
- Route-level guards and persisted Zustand state must not create hydration/redirect loops.

### Required verification
Run from web/:
- npm run lint
- npx tsc --noEmit
- npm run build

Then test these exact flows:
1. Fresh browser -> /login -> SUPER_ADMIN -> /tenants
2. Refresh /tenants with valid persisted session
3. Logout -> direct /tenants access -> redirect to /login
4. Hospital role -> direct /tenants access -> redirect to /login
5. Super Admin -> open every primary Super Admin route
6. Tenant profile -> change tenant -> live branding preview must follow selected tenant
7. Suspend tenant -> exactly one platform audit event
8. Restore tenant -> exactly one platform audit event
9. Unknown tenant access evaluation -> denied
10. Tenant with missing subscription -> denied
11. Department-scoped role with missing departmentId -> denied
12. Mobile navigation -> every Super Admin route reachable without overflow or dead click

## Required Six-Section Fix Report Rules
When fixes are implemented, save a new markdown report under:
web/src/app/(super-admin)/

Use exactly these six sections:
1. Routing & Navigation
2. Authentication & Authorization
3. Audit, Lifecycle & Licensing
4. Branding State & UI Consistency
5. Responsive UI & Workflow Reliability
6. Runtime / 500 Prevention & Verification

For every fix include:
- file
- exact defect
- root cause
- change made
- verification performed
- remaining limitation, if any

Do not report a fix as verified unless the source or build output supports it.

## Important Branch Instruction
Antigravity is currently working against main. Do not rewrite or revert unrelated work already on main. Apply only verified fixes from this report and preserve existing correct changes.
