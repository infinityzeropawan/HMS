# HMS AI START HERE — Master Agent Operating Contract

> Repository: `infinityzeropawan/HMS`  
> Working branch: `chatgpt`  
> Product: Multi-Tenant SaaS Hospital Management System (India)  
> Primary specification: `frontend_ui_ux_implementation_plan.md`  
> Mission: enable GPT, Claude, Gemini, Cline, Cursor/Kilo and other coding agents to work on HMS with the same verified project context, architecture discipline, UI/UX language, routing map, safety rules and handoff process.

---

## 0. What this file is

This file is the first document an AI coding agent must read before changing HMS.

It is not a replacement for the master UI/UX specification or the repository code. It is an **agent operating contract** that tells an AI:
- what HMS is,
- what source to trust,
- how to inspect work,
- how to preserve architecture,
- how to reason about routes and data,
- how to handle healthcare/compliance-sensitive workflows,
- how to verify changes,
- and how to leave usable context for the next AI.

The master specification defines the intended product and experience across design system, routing, authentication, Super Admin, Hospital Admin, Reception, Doctor, Nurse/IPD, OT, Pharmacy, Lab/Radiology, Billing/TPA, IPD, Patient Portal/ABHA, HR, Compliance, Notifications, Print, Flutter mobile, shared components, PWA/offline, accessibility/i18n and QA. It also defines phase-1 implementation priorities and safety constraints.

The agent must never use this file as an excuse to skip the master specification.

---

# 1. Product identity

## 1.1 Product definition

HMS is a **Multi-Tenant SaaS Hospital Management System for India**.

The documented product stack is:
- **Flutter** for mobile applications
- **Next.js/React + Ant Design** for the web application
- **Next.js API routes/BFF** where the architecture uses that layer
- shared frontend components, hooks, stores and supporting libraries

The documented compliance and interoperability context includes:
- ABDM
- FHIR R4
- DPDP Act 2023
- GST
- NABH/NABL

The master document identifies the current scope as **Phase 1 MVP End-to-End**.

## 1.2 Product domains

HMS is not a collection of unrelated CRUD screens. The product is a connected hospital workflow.

Important domains include:
- platform and tenant management,
- hospital configuration,
- authentication and onboarding,
- patient registration and identity,
- appointment and OPD queue management,
- doctor EHR/EMR,
- nursing and IPD workflows,
- OT,
- pharmacy,
- laboratory and radiology,
- billing and TPA,
- HR/payroll/rosters,
- compliance and audit,
- notifications,
- print/document generation,
- patient portal and ABHA,
- mobile workflows,
- PWA/offline workflows,
- accessibility and localization.

An agent must therefore trace the **workflow** around a page, not only the file being edited.

---

# 2. Mandatory source-of-truth hierarchy

Use this hierarchy when interpreting requirements:

## Level 1 — Master product specification
`frontend_ui_ux_implementation_plan.md`

This is the primary source for:
- product behavior,
- UI/UX expectations,
- route inventory,
- module-specific screens,
- field definitions,
- interaction requirements,
- design tokens,
- accessibility,
- responsive behavior,
- PWA/offline requirements,
- testing expectations,
- clinical/compliance safety rules.

## Level 2 — Actual repository architecture and working implementation

The repository is the implementation reality.

Use code to verify:
- which routes actually exist,
- how layouts are structured,
- what components already exist,
- which stores/hooks/services are used,
- which API contracts exist,
- what data is mock/demo versus persisted,
- what RBAC mechanisms exist,
- what shared patterns are already established.

A documentation route that is absent from the repository is **not automatically a route to create**.

## Level 3 — Existing specialized agent skills

Read the applicable files under `.agents/skills/`.

Existing skills are additive guidance. Do not casually replace or weaken them.

## Level 4 — Current task instruction

Respect the current task, but interpret it inside the product/specification and existing architecture.

## Conflict handling

When two sources conflict:
1. identify the exact conflict,
2. determine whether it is only documentation versus implementation,
3. avoid silent architecture changes,
4. record the unresolved issue,
5. make the smallest safe change only when the intended behavior is sufficiently clear.

Never invent missing requirements simply because an agent believes they would be cleaner.

---

# 3. Mandatory reading order

Before changing code, read the minimum relevant context.

### Always
1. `frontend_ui_ux_implementation_plan.md`
2. `.agents/skills/frontend.md`
3. `.agents/skills/premium-ui-ux.md`
4. `.agents/skills/responsive-design.md`
5. `.agents/skills/compliance.md`
6. `.agents/skills/multi-tenancy.md`

### When applicable
7. `.agents/skills/api-design.md`
8. `.agents/skills/backend-security.md`
9. `.agents/skills/database.md`
10. `.agents/MOBILE_PATTERNS.md`

Then inspect the target module's actual repository files and direct dependencies.

Do not read hundreds of unrelated files merely to say the project was "audited". Work in a controlled scope.

---

# 4. Operating philosophy

HMS agent work follows:

**Inspect → Trace → Compare → Plan → Fix → Verify → Handoff**

Never:

**Guess → Rewrite → Hope**

## 4.1 Inspect first

Start from the exact page, route, component, store, hook or service relevant to the task.

Identify:
- file path,
- route,
- parent layout,
- imports,
- props,
- local state,
- store dependencies,
- API calls,
- navigation actions,
- role/permission checks,
- related UI components.

## 4.2 Trace before editing

Follow the user journey.

For a button:
`Page → handler → state/API call → success/error → destination`

For a list:
`Page → data source → loading/error/empty → row action → detail route`

For a form:
`Field → validation → submit handler → API/service → persistence → feedback → refreshed state`

For a clinical workflow:
`Draft → review → explicit sign-off → final/signed state → audit`

## 4.3 Compare

Compare the implementation to:
- master specification,
- relevant existing skill,
- existing project pattern,
- actual backend/API contract when applicable.

Classify observations as:
- compliant,
- partially compliant,
- mismatch,
- missing,
- blocked,
- uncertain.

Do not treat uncertainty as a confirmed bug.

## 4.4 Plan the smallest safe change

Prefer:
- extending existing components,
- reusing existing hooks/stores,
- correcting route targets,
- fixing null handling,
- completing an existing state machine,
- connecting an already-defined API,
- adding missing responsive behavior.

Avoid:
- framework migration,
- architecture rewrite,
- route renaming,
- global state replacement,
- mass component duplication,
- speculative backend creation.

---

# 5. Product architecture snapshot

## 5.1 Web application

The master specification documents an App Router structure with role-oriented route groups:
- `(auth)`
- `(super-admin)`
- `(hospital-admin)`
- `(reception)`
- `(doctor)`
- `(nurse)`
- `(ot)`
- `(pharmacy)`
- `(lab)`
- `(radiology)`
- `(billing)`
- `(hr)`
- `(compliance)`
- `(patient-portal)`
- `api/` BFF/API surface

The documented shared frontend layers include:
- `components/ui`
- `components/forms`
- `components/layout`
- `components/tables`
- `components/print`
- `components/charts`
- `hooks`
- `store`
- `lib/api-client.ts`
- `lib/fhir-mapper.ts`
- `lib/gst-engine.ts`
- global and print styles

The agent must verify the current repository structure before assuming these exact paths remain unchanged.

## 5.2 Flutter application

The documented Flutter structure includes:
- `core/api`
- `core/auth`
- `core/theme`
- `core/widgets`
- `core/utils`
- feature-specific directories,
- `models`,
- `routes`,
- `main.dart`.

Again, verify actual current paths before changing them.

---

# 6. Design-system contract

The documented HMS healthcare theme uses:

| Token | Value | Typical meaning |
|---|---|---|
| Primary Teal | #0D9488 | Primary CTA, active navigation |
| Dark Teal | #0F766E | Hover/strong primary |
| Emerald | #059669 | Success, normal clinical state |
| Light Teal | #F0FDFA | Supporting background |
| Soft Cyan | #E0F2FE | Informational patient context |
| Dark Slate | #0F172A | App bars/header/sidebar |
| Slate 700 | #334155 | Body text |
| Slate 400 | #94A3B8 | Hints/placeholders |
| White | #FFFFFF | Card surfaces |
| Background Grey | #F8FAFC | Application scaffold |
| Crimson | #E11D48 | Errors, STAT, allergy/critical |
| Amber | #F59E0B | Warnings/pending |
| Info Blue | #0EA5E9 | Informational/ABHA |
| Purple | #7C3AED | AI-generated indicators |

Typography baseline:
- H1: 32/40
- H2: 24/32
- H3: 18/28
- H4: 16/24
- Body: 14/22
- Small: 12/18
- Mono: 13px for IDs/lab values/drug codes

Spacing:
- 4px base unit
- 4, 8, 12, 16, 20, 24, 32, 48, 64px scale
- 12px standard card radius
- 8px compact radius
- 16px modal radius
- 1440px maximum content width

Do not introduce a new visual language inside a single module unless explicitly required.

---

# 7. Responsive and mobile contract

Required documented breakpoints:

| Width | Target |
|---|---|
| 320–767px | Mobile |
| 768–1023px | Tablet |
| 1024–1279px | Small laptop |
| 1280–1439px | Desktop |
| 1440px+ | Large clinical workstation |

Mobile requirements include:
- interactive targets >= 44×44px,
- no accidental page-level horizontal overflow,
- usable forms,
- appropriate table treatment,
- drawers/modals that fit,
- readable header actions,
- keyboard and touch accessibility where relevant.

A page is not considered complete merely because it works at a desktop viewport.

---

# 8. Authentication and identity contract

Documented role redirects include:

| Role | Destination |
|---|---|
| super_admin | /super-admin/tenants |
| hospital_admin | /hospital-admin/dashboard |
| doctor | /doctor/dashboard |
| receptionist | /reception/dashboard |
| nurse | /nurse/dashboard |
| pharmacist | /pharmacy/dashboard |
| lab_tech | /lab/dashboard |
| billing | /billing/dashboard |
| patient | /patient-portal/my-records |

Rules:
- never store raw passwords in UI state,
- web JWT handling uses the documented secure-cookie approach,
- Flutter uses secure storage,
- session expiry warning is expected where specified,
- role-based redirect must correspond to the actual route tree,
- authorization is not replaced by hiding a menu item.

Authentication and authorization must be verified independently.

---

# 9. Multi-tenancy contract

HMS is multi-tenant.

Every agent must think in terms of:
- tenant scope,
- hospital scope,
- authenticated user scope,
- role/permission scope.

Non-negotiable:
- tenant/hospital identifiers must not be trusted merely because a URL contains them,
- server-side authorization remains authoritative,
- data queries must remain within the authenticated tenant/hospital boundary,
- UI must not expose arbitrary cross-tenant access paths,
- demo IDs and hard-coded tenant identities must not become production logic.

When an ID appears in a route, verify who is allowed to access it and how the server validates ownership/scope.

---

# 10. Clinical safety contract

Clinical workflows have stronger requirements than ordinary CRUD.

The documented rules require:
- no automatic finalization of prescriptions,
- no automatic finalization of lab orders,
- no automatic finalization of clinical notes,
- AI-generated clinical content must visibly identify itself,
- human review must happen before final sign-off,
- signed artifacts must preserve explicit signing information where required,
- post-signature/read-only semantics must be preserved.

Examples include:
- doctor SOAP AI draft,
- e-prescription sign/finalize,
- lab/pathology result verification,
- discharge summary sign-off,
- teleconsult consent/signature flows,
- nurse shift handover submission.

An agent must not remove a confirmation, signature step, review badge or lock simply to make a demo faster.

---

# 11. Privacy and compliance contract

The master specification documents:
- Aadhaar must remain masked,
- consent artefacts must exist before applicable PII sharing,
- audit logs are append-only,
- compliance workflows must expose sufficient traceability,
- ABDM/FHIR functionality must preserve the documented workflow boundaries,
- GST-related UI must preserve required tax information.

For Aadhaar, UI must use the documented masked presentation pattern and must never expose an unmasked number.

For consent:
- show applicable consent state,
- keep purpose/expiry/revocation information where specified,
- do not imply consent that was not actually recorded.

For audit:
- display logs read-only where required,
- never create UI controls that imply an actor can edit/delete immutable history.

---

# 12. Module understanding

The documented HMS module map is:

### Platform
- Super Admin dashboard
- Tenants
- Subscription plans
- Feature flags
- Global masters
- Support tickets
- Platform audit

### Hospital Administration
- Dashboard
- Hospital settings
- Departments
- Wards
- Beds
- Users
- Roles/RBAC
- Print templates
- Accreditations

### Reception
- Dashboard
- Patient registration
- Patient detail
- Appointments
- OPD queue
- Token display

### Doctor
- Dashboard
- OPD queue
- Encounter
- Vitals
- SOAP
- Diagnosis
- e-Prescription
- Lab/Radiology orders
- Referral
- Teleconsult
- Payout summary

### Nurse/IPD
- Ward view
- Vitals
- MAR
- Nursing notes
- Diet
- Shift handover

### OT
- Schedule
- Booking
- WHO-style checklist
- Anesthesia notes

### Pharmacy
- Dashboard
- Dispense
- Inventory
- Stock batches
- Purchase orders
- Controlled drugs

### Laboratory/Radiology
- Dashboard
- Orders
- Sample collection
- Result entry
- Report view
- DICOM/PACS-related workflows

### Billing/TPA
- Dashboard
- Invoices
- Payments
- GST reports
- TPA claims
- Discount approvals

### IPD
- Admission
- Active admission
- Clinical care
- Discharge
- Bed release
- Final billing

### Patient Portal/ABHA
- My records
- Appointments
- Prescriptions
- ABHA linkage
- Consent management

### HR
- Staff
- Shifts
- Rosters
- Leave
- Attendance
- Payroll
- Doctor payout ledger

### Compliance
- Audit logs
- Consents
- DPDP report

### Cross-cutting
- Notifications
- Printing
- PWA/offline
- Accessibility/i18n
- Shared components

---

# 13. Shared-component discipline

The master specification defines atomic and domain-specific shared components.

Examples:
- `HmsButton`
- `HmsInput`
- `HmsSelect`
- `HmsDatePicker`
- `HmsTimePicker`
- `HmsTextarea`
- `HmsSwitch`
- `HmsTag`
- `HmsBadge`
- `HmsAvatar`
- `HmsCard`
- `HmsModal`
- `HmsDrawer`
- `HmsTable`
- `HmsSkeleton`
- `HmsAlert`
- `HmsStatCard`
- `HmsBreadcrumb`
- `HmsPageHeader`
- `HmsTabs`
- `HmsTimeline`
- `HmsFileUpload`
- `HmsQrCode`
- `HmsBarcode`

Domain examples:
- `PatientSearchBar`
- `PatientSummaryCard`
- `VitalsCard`
- `VitalsTrendChart`
- `DiagnosisSelector`
- `DrugSearchInput`
- `PrescriptionItemRow`
- `LabOrderRow`
- `GstCalculatorWidget`
- `InvoiceLineItemRow`
- `BedStatusMap`
- `TokenQueueBoard`
- `AbhaLinkWidget`
- `ConsentBanner`
- `AiDraftBadge`
- `SignatureCapture`
- `PrintPreviewModal`

Before creating a component, search for an existing reusable implementation.

If a component already exists but is incomplete, improve it in place when that is safe.

---

# 14. Routing contract

Routing is a functional requirement, not just navigation polish.

For every link/action:
1. identify source page,
2. identify intended semantic destination,
3. verify actual repository route,
4. verify dynamic parameters,
5. verify parent-child relationship,
6. verify authentication,
7. verify RBAC/permission,
8. verify destination data can actually load.

Check:
- sidebar items,
- topbar shortcuts,
- breadcrumbs,
- card CTAs,
- table row actions,
- view/edit buttons,
- create buttons,
- cancel/back controls,
- deep links,
- post-submit redirects.

A button labelled "View Patient" must not send a user to an unrelated dashboard just because that route already exists.

---

# 15. Data-state contract

Every page with dynamic content should intentionally define:

### Loading
What is shown before data is ready?

### Empty
What is shown when there are no records?

### Error
What happens when a request fails?

### Permission denied
What happens when the authenticated user lacks permission?

### Success
What feedback follows a successful mutation?

### Partial/degraded
What happens if some widgets/data sources are unavailable?

### Offline
Where the master specification defines offline capability, what is cached, queued or disabled?

A page that only renders the happy-path dataset is incomplete.

---

# 16. Data source classification

Every observed data path must be classified.

### UI_ONLY
The interaction exists but no persistence/backend integration is present.

### DEMO_DATA
Mock arrays, fixtures, seeders or demo stores supply the data.

### API_CONNECTED
A real frontend API/client integration exists.

### PERSISTED
A verified mutation reaches the intended persistent backend/storage.

### BLOCKED
The required backend contract/dependency is missing or unusable.

Never upgrade a status just because code "looks like" it should persist.

---

# 17. Frontend → backend tracing standard

For a backend-dependent feature, trace:

`UI
→ component state
→ hook/store
→ client/service
→ endpoint
→ controller
→ validation
→ authorization
→ domain service
→ persistence
→ response DTO
→ state update
→ user feedback
→ audit event`

Capture the exact missing link when the chain breaks.

Examples:
- form exists but endpoint missing → BLOCKED
- endpoint exists but frontend uses wrong field names → mismatch
- API succeeds but UI never invalidates stale data → state bug
- UI shows success but server returns authorization error → false-success bug
- list is populated from mock array while backend exists → DEMO_DATA mismatch

---

# 18. Performance and usability contract

The master specification documents targets such as:
- dashboard first load < 2s,
- patient search < 500ms,
- SOAP autosave interaction < 1s,
- lab result entry < 1.5s,
- invoice generation < 2s,
- print preview < 3s.

Treat these as target requirements to verify where instrumentation/measurement is available.

Do not claim that a target is met without evidence.

For high-frequency workflows:
- minimize unnecessary clicks,
- preserve keyboard-friendly interactions,
- debounce search where specified,
- keep critical actions visible,
- avoid blocking the user with avoidable redraws or transitions.

---

# 19. PWA and offline contract

Documented offline strategy includes:
- app shell CacheFirst,
- non-clinical API StaleWhileRevalidate,
- patient demographics background sync with IndexedDB,
- clinical notes/vitals/MAR offline queue,
- versioned static asset caching.

Offline-capable screens include documented ward vitals, MAR, nursing notes and patient demographics scenarios.

When working on offline workflows:
- never silently discard data,
- expose sync state,
- distinguish local draft from server-confirmed data,
- preserve conflict visibility for clinical data,
- never display "saved to server" when only local storage succeeded.

---

# 20. Accessibility and localization contract

Accessibility baseline:
- WCAG 2.1 AA target,
- adequate color contrast,
- visible focus,
- keyboard navigation,
- ARIA labels,
- screen-reader-friendly form associations,
- reduced-motion handling,
- minimum font sizes,
- 44×44 mobile touch targets.

Localization baseline:
- English primary,
- Hindi support,
- tenant-configurable regional language support where specified,
- India date format DD/MM/YYYY,
- 12-hour time with AM/PM,
- INR formatting,
- Indian numbering convention.

Do not break semantics to make a page visually compact.

---

# 21. Demo reliability contract

The project's demo requirement is especially important.

Every modified screen should be reviewed for:
- avoidable 500 errors,
- null/undefined crashes,
- missing environment assumptions,
- broken imports,
- missing provider/context wrappers,
- invalid client/server boundaries,
- stale routes,
- failed API paths,
- buttons that do nothing,
- fake success toasts,
- broken mobile layouts.

A demo workaround must not become a production security or data-integrity defect.

When backend functionality is unavailable, prefer an explicit blocked/demo state over pretending the operation persisted.

---

# 22. Audit methodology

## Phase 1 — Define scope
Exactly one module/page or tightly bounded workflow.

## Phase 2 — Read relevant files
Target page + direct components + state/data + route/layout.

## Phase 3 — Trace dependencies
Navigation, stores, hooks, API and destination.

## Phase 4 — Compare against source
Master spec + skills + actual architecture.

## Phase 5 — Categorize findings
- BLOCKER
- HIGH
- MEDIUM
- LOW
- INFORMATIONAL

## Phase 6 — Fix
Smallest safe architecture-preserving change.

## Phase 7 — Verify
Use the strongest available evidence:
- static inspection,
- typecheck/build,
- unit/component tests,
- route inspection,
- targeted runtime test,
- browser/device validation where available.

## Phase 8 — Handoff
Update the relevant agent-memory/task record.

---

# 23. Finding format

Use this structure:

### [SEVERITY] Finding title

**Location:** `path/to/file.tsx:line`  
**Route:** `/actual/route`  
**Category:** UI / UX / Routing / Data / API / Security / Compliance / Responsive / Performance  
**Observed:** what the code actually does  
**Expected:** what the source or workflow requires  
**Evidence:** exact code behavior or repository evidence  
**Impact:** user/demo/clinical/security/data impact  
**Recommended action:** smallest safe fix  
**Status:** Open / Fixed / Blocked / Needs verification

Never write a finding that cannot be supported by code or the source document.

---

# 24. Change-management rules

An agent must:

### Preserve
- existing route names unless change is required,
- existing architecture,
- working components,
- established store/service patterns,
- compatibility with other modules.

### Avoid
- unrelated refactors,
- dependency upgrades without need,
- mass renaming,
- removing business logic to silence errors,
- replacing shared components with local copies,
- changing API contracts without backend alignment.

### When architecture change is genuinely required
Document:
- why the current architecture cannot satisfy the requirement,
- exact files affected,
- downstream impact,
- migration/compatibility strategy,
- rollback considerations.

---

# 25. Current phase principle

The master document defines a Phase 1 end-to-end sequence that begins with:
1. Design System & Tokens
2. Auth
3. Reception
4. Doctor
5. Billing
6. Pharmacy
7. Lab
8. Nurse
9. Hospital Admin
10. Compliance
11. Super Admin
12. Patient Portal/ABHA
13. IPD/OT/HR/Payroll

This sequence is a product planning signal, not permission to modify multiple modules at once.

For audit/repair work, remain focused on the user-selected module unless a dependency must be inspected.

---

# 26. Context handoff protocol

At the start of every agent session, establish:

**Current module:**  
**Current route:**  
**Current objective:**  
**Relevant files:**  
**Source sections:**  
**Applicable skills:**  
**Known findings:**  
**Backend dependency:**  
**Current status:**

At the end, record:

**Files inspected:**  
**Files changed:**  
**Confirmed findings:**  
**Fixes implemented:**  
**Verification:**  
**Remaining blockers:**  
**Next exact file/action:**

The next AI must be able to continue without re-reading unrelated modules.

---

# 27. Agent collaboration rules

Different agents may use different reasoning styles, but they must share the same contracts.

### GPT/ChatGPT
Follow this operating contract and preserve evidence.

### Claude
Use the same source hierarchy and do not replace architecture from style preference.

### Gemini
Use the same route/data/compliance contracts and verify claims against repository evidence.

### Cline/Cursor/Kilo/other coding agents
Use the same module scope, handoff state and Definition of Done.

The objective is not to make all agents think identically. The objective is to make them **change the same product under the same constraints**.

---

# 28. Stop conditions

Stop and report a blocker when:
- required backend API is absent,
- required database schema is absent,
- route ownership is ambiguous,
- the task would require undocumented architecture replacement,
- authentication/RBAC behavior cannot be safely inferred,
- a compliance requirement would be weakened,
- a clinical sign-off boundary would be bypassed,
- the change risks breaking unrelated workflows.

Do not invent a solution merely to avoid reporting a blocker.

---

# 29. Definition of Done

A task is complete only when all applicable items are true:

### Product
- behavior matches the relevant master specification,
- terminology matches the product language,
- workflow is semantically correct.

### Architecture
- existing architecture preserved,
- shared patterns reused,
- no unnecessary duplicate abstraction.

### Routing
- route exists,
- dynamic parameter is valid,
- correct destination,
- correct authorization.

### UI/UX
- design tokens followed,
- visual hierarchy is clear,
- buttons and forms behave correctly,
- loading/empty/error/success states handled.

### Responsive
- relevant breakpoint behavior verified,
- mobile interaction remains usable,
- no avoidable overflow or clipped controls.

### Data
- data source classified,
- state transitions verified,
- persistence claims are honest.

### Security/compliance
- multi-tenant scope preserved,
- RBAC enforced,
- Aadhaar masked,
- consent rules preserved,
- audit behavior preserved.

### Clinical
- explicit human sign-off preserved,
- AI draft state visible where applicable,
- signed/final states remain distinct.

### Verification
- relevant checks/tests/build completed where possible,
- no known avoidable runtime errors introduced,
- evidence recorded,
- blockers documented.

---

# 30. Final rule

**Never optimize for "the page looks finished."**

Optimize for:

**correct route + correct workflow + correct data state + correct permissions + correct responsive behavior + correct clinical/compliance boundary + verified implementation.**

When in doubt:
1. read the source,
2. inspect the actual code,
3. trace the dependency,
4. make the smallest safe change,
5. verify it,
6. leave evidence for the next agent.
