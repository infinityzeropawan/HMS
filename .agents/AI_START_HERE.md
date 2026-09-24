# HMS AI START HERE

> Repository: `infinityzeropawan/HMS`  
> Branch: `chatgpt`  
> Master specification: `frontend_ui_ux_implementation_plan.md`

## 1. Mandatory reading order

Before changing code, read:

1. `frontend_ui_ux_implementation_plan.md` — master frontend/UI/UX, routing, module, QA and safety specification.
2. `.agents/skills/frontend.md` — frontend implementation guidance.
3. `.agents/skills/premium-ui-ux.md` — premium UI/UX patterns.
4. `.agents/skills/responsive-design.md` — responsive behavior.
5. `.agents/skills/compliance.md` — compliance requirements.
6. `.agents/skills/multi-tenancy.md` — tenancy boundaries.
7. `.agents/skills/api-design.md` — API conventions when API work is introduced.
8. `.agents/skills/backend-security.md` — backend/security conventions when backend work is introduced.
9. `.agents/skills/database.md` — persistence conventions when database work is introduced.
10. `.agents/MOBILE_PATTERNS.md` — mobile implementation patterns.

Do not treat a shorter summary as a replacement for the master specification.

## 2. Source-of-truth hierarchy

When documents appear to conflict:

1. `frontend_ui_ux_implementation_plan.md`
2. Existing repository architecture and working code
3. Specialized `.agents/skills/*.md`
4. Current task instructions

Never silently invent a rule that is absent from the source documents. Flag unresolved conflicts before making architecture-changing edits.

## 3. Current project scope

HMS is a multi-tenant hospital management system for India using Flutter for mobile and Next.js/React + Ant Design for web. The master guide defines the design system, route inventory, authentication flows, role-specific modules, shared components, PWA/offline behavior, accessibility/i18n and QA expectations.

## 4. UI/UX baseline

Use the master design tokens exactly unless the task explicitly changes them.

Primary:
- Teal: `#0D9488`
- Dark Slate: `#0F172A`
- Emerald: `#059669`

Base spacing unit: 4px. Standard spacing scale: 4, 8, 12, 16, 20, 24, 32, 48, 64px.

Responsive targets:
- 320–767px: mobile
- 768–1023px: tablet
- 1024–1279px: small laptop
- 1280–1439px: desktop
- 1440px+: large workstation

All UI work must preserve responsive behavior, keyboard usability, accessibility, loading/empty/error/success states and shared-component reuse.

## 5. Routing integrity

Before modifying navigation:

- Verify the target route exists in the actual repository.
- Verify the destination matches the intended feature.
- Do not redirect a button to a convenient but semantically different page.
- For dynamic routes, verify parameter shape and parent-child relationships.
- Check all breadcrumbs, sidebar links, CTA buttons, table row actions and detail links.
- Check route guards/RBAC where implemented.
- Never introduce a route only in documentation; confirm the actual file/router implementation.

The master guide is the planned route contract; the repository is the implementation reality.

## 6. Data-flow integrity

At this phase, some screens may be UI/routing only and backend APIs may not yet exist.

When backend/API/database is absent:
- Do not fake a completed backend integration.
- Keep mock/demo state clearly isolated.
- Keep forms and UI data shapes aligned with the master specification.
- Do not claim persistence, API delivery, or database writes unless implemented and verified.
- Avoid hardcoded values inside reusable UI where the screen contract implies dynamic data.

When backend integration exists:
- Trace input → validation → state → API/service → persistence → UI feedback.
- Verify success, failure, loading, empty and retry states.

## 7. Clinical and safety guardrails

Never auto-submit prescriptions, lab orders or clinical notes without explicit physician sign-off.

AI-generated drafts must be clearly marked as AI-generated and require human review before final sign-off.

Aadhaar must remain masked in UI. Consent must be recorded before PII sharing. Audit logs are append-only/read-only in the UI.

Tenant and hospital scope must come from verified authenticated context; never trust tenant/hospital identifiers supplied solely by URL parameters.

## 8. Audit workflow for every task

### Step A — Inspect
Read the target file and directly related files first.

### Step B — Trace
Trace imports, navigation, state, forms, event handlers and destination pages.

### Step C — Compare
Compare implementation against:
- master specification
- applicable skill files
- existing repository conventions

### Step D — Fix
Make the smallest architecture-preserving changes needed.

### Step E — Verify
Check:
- type/build/lint where available
- route destinations
- interactive controls
- responsive layouts
- loading/error/empty states
- no obvious console/runtime errors

### Step F — Report
Record:
- files inspected
- findings
- changes made
- remaining limitations
- verification performed

## 9. Do not do these

- Do not replace the existing architecture without explicit authorization.
- Do not rename routes casually.
- Do not create duplicate components when a shared component is intended.
- Do not hardcode tenant/hospital identity into UI.
- Do not remove safety/compliance controls to make a demo work.
- Do not mark a module complete without verifying its actual interactive behavior.

## 10. Context preservation

At the start of each task, state internally:
- current module
- current route
- target file(s)
- source-of-truth sections
- known constraints
- previous unresolved findings

At the end, leave a concise handoff in the task report so another AI can continue without re-auditing unrelated modules.

## 11. Definition of Done

A frontend task is complete only when the implementation:
- matches the relevant master-spec behavior
- uses approved design patterns/tokens
- routes to the correct destination
- handles expected UI states
- is responsive at the relevant breakpoints
- respects RBAC/compliance constraints where applicable
- does not introduce avoidable runtime/build errors
- documents any blocked dependency on backend/API/database work
