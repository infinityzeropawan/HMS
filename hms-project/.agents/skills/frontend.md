# SKILL: Frontend Architecture — Non-Negotiable Rules & Design Standards

<!-- Source: HMS Frontend Architecture Rules, UI/UX Implementation Plan -->

> **MANDATORY FOR ALL AI AGENTS WRITING FRONTEND CODE**
> These rules are NON-NEGOTIABLE. Violating any of these rules is treated as a hard error, not a warning.
> Read every section before writing a single line of `.tsx`, `.ts`, `.dart`, or `.css`.

---

## 0. Quick Reference: What AI Must NEVER Do

| ❌ Forbidden | ✅ Required |
|---|---|
| `any` TypeScript type | `unknown` + Zod narrowing |
| Inline hex colors in JSX: `bg-[#0D9488]` | Tailwind token class: `bg-primary-teal` |
| Hardcoded dropdown/filter data in JSX | Extract to `[module]_constants.ts` |
| Generic folder names: `components/`, `helpers/`, `utils/` | Prefixed module folders: `reception_components/` |
| `@ts-ignore` or `@ts-nocheck` | Fix the type error |
| File > 300 lines (component) | Split into child components in same folder |
| Cross-role shared business components | Duplicate into each role's isolated folder |
| Unmasked Aadhaar in any UI | Always `XXXX-XXXX-1234` |
| API data or loading state in React Context | TanStack Query is the only server-state owner |
| Complex logic mixed with JSX in `.tsx` | Extract to adjacent `use[ComponentName].ts` |
| `"use client"` absent on hook-using component | Always add `"use client";` on line 1 |
| Inline type union strings `'idle' \| 'loading'` | Extract to named type in `_types.ts` |
| Generic prop type names: `Props`, `Data` | Prefixed: `ReceptionPatientSearchBoxProps` |

---

## 1. UI Tech Stack & Component Library

- **Framework**: Next.js (App Router) + React 18 + TypeScript (strict mode)
- **Component Library**: Ant Design (`antd`) with custom HMS theme tokens
- **State — Server/Async**: TanStack Query (`@tanstack/react-query`) — **sole owner of API data**
- **State — Client/UI**: Zustand (module-scoped stores only) + local `useState`
- **State — UI Config**: React Context (theme, sidebar, locale — sync/rarely-changing only)
- **Validation**: Zod for all API boundary parsing and form schemas
- **Styling**: Vanilla CSS variables defined in `globals.css`, mapped in `tailwind.config.ts`, consumed as Tailwind class names
- **Mobile**: Flutter (Dart) with the `AppTheme` token system

---

## 2. Rule 1 — Micro-Modularization & File Size Ceilings

### 2.1 One File = One Component = One Responsibility

- Every `.tsx` file exports exactly one React component.
- Every component handles exactly one micro-functionality.
- The exported component/function/class name inside the file MUST exactly match the filename (minus extension).
  ```
  ✅ File: ReceptionPatientSearchBox.tsx
     Export: export function ReceptionPatientSearchBox(...)
  
  ❌ File: SearchBox.tsx
     Export: export function PatientSearch(...)
  ```

### 2.2 Prefixed Module Sub-Folder Structure (CRITICAL)

Never dump micro-files into a single flat directory.
Always group into logically cohesive sub-folders prefixed with the module name:

```
app/(reception)/
├── registration/
│   └── page.tsx                              ← Thin Server Component, composes pieces
│
└── _reception_components/
    ├── PatientSearch/
    │   ├── ReceptionPatientSearchBox.tsx
    │   ├── ReceptionPatientSearchResultRow.tsx
    │   ├── ReceptionPatientSearchEmptyState.tsx
    │   └── useReceptionPatientSearch.ts
    ├── RegistrationWizard/
    │   ├── ReceptionRegistrationWizardShell.tsx
    │   ├── ReceptionRegistrationStepDemographics.tsx
    │   ├── ReceptionRegistrationStepAbhaLinkage.tsx
    │   ├── ReceptionRegistrationStepUhidGenerated.tsx
    │   └── useReceptionRegistrationWizard.ts
    └── AbhaVerification/
        ├── ReceptionAbhaVerificationModal.tsx
        └── useReceptionAbhaVerification.ts
```

**Prefix rule**: Use `[moduleName]_components/`, `[moduleName]_context/`,
`[moduleName]_hooks/`, `[moduleName]_utils/`, `[moduleName]_store/`, `[moduleName]_types/`.

**Why?** When an AI agent is given `@reception_components/`, it loads ONLY that module's context, eliminating cross-role hallucinations.

### 2.3 File Size Ceilings (Hard Limits)

| File Type | Max Lines | Action When Exceeded |
|---|---|---|
| React Component (`.tsx`) | **300 lines** | Extract sub-sections into child component files in same folder |
| Custom Hook (`use*.ts`) | **150 lines** | Split by responsibility into multiple hooks |
| Utility / formatter (`*.utils.ts`) | **120 lines** | Split by feature domain |
| Zustand Store (`*.store.ts`) | **180 lines** | Split into multiple scoped stores |
| Zod Schema / type (`*.schema.ts`, `*.types.ts`) | **200 lines** | Split into api / domain / ui type files |
| API service file (`*.api.ts`) | **200 lines** | Split by resource/endpoint group |
| Constants (`*.constants.ts`) | **150 lines** | Split by data domain |

Split by **feature responsibility**, NOT randomly by line count.
Do NOT create `helpers/`, `common/`, `misc/` dumping folders.

---

## 3. Rule 2 — Total Role Isolation (No Shared Business Components)

Each role gets a completely isolated route group. Business components are NEVER shared across roles.

```
app/
├── (auth)/          ← Auth flows only
├── (super-admin)/   ← SuperAdmin exclusive
├── (hospital-admin)/← HospitalAdmin exclusive
├── (reception)/     ← Receptionist exclusive
├── (doctor)/        ← Doctor exclusive
├── (nurse)/         ← Nurse exclusive
├── (ot)/            ← OT team exclusive
├── (pharmacy)/      ← Pharmacist exclusive
├── (lab)/           ← Lab Tech exclusive
├── (radiology)/     ← Radiologist exclusive
├── (billing)/       ← Billing exclusive
├── (hr)/            ← HR Admin exclusive
├── (compliance)/    ← DPO/Compliance exclusive
└── (patient-portal)/← Patient-facing exclusive
```

**Business component duplication rule:**
```
✅ DoctorEncounterDiagnosisTable.tsx  (in (doctor)/_doctor_components/)
✅ NurseAdmissionDiagnosisSummaryCard.tsx (in (nurse)/_nurse_components/)

❌ shared/DiagnosisTable.tsx  ← FORBIDDEN for business components
```

**Only genuinely dumb, stateless, purely visual UI primitives may live in:**
```
src/components/ui/    ← HmsButton, HmsCard, HmsBadge, HmsModal etc.
                         (No business logic, no API calls, no domain types)
```

---

## 4. Rule 3 — Hyper-Descriptive Naming & Module Prefix

### 4.1 Naming Format

```
[RoleName][DomainArea][SpecificThing][UIStructuralType]

✅ ReceptionPatientRegistrationUhidCard.tsx
✅ DoctorEncounterSoapNoteSubjectiveTextarea.tsx
✅ BillingInvoiceGstBreakdownTable.tsx
✅ PharmacyDispenseFEFOBatchSelectorDropdown.tsx
✅ NurseMarAdministrationTimelineCell.tsx
```

### 4.2 Strict Suffixes

| Suffix | When to use |
|---|---|
| `...Form.tsx` | A form with inputs and submission |
| `...Table.tsx` | A data table |
| `...Modal.tsx` | A dialog/modal |
| `...Drawer.tsx` | A side-panel |
| `...Card.tsx` | A display card |
| `...Dropdown.tsx` | A select/dropdown |
| `...Button.tsx` | A standalone button with special logic |
| `...Badge.tsx` | A status/count badge |
| `...Skeleton.tsx` | A loading skeleton |
| `...EmptyState.tsx` | An empty state illustration |
| `...Banner.tsx` | A banner/alert strip |
| `...Wizard.tsx` / `...Shell.tsx` | A multi-step container |
| `...Timeline.tsx` | A chronological feed |
| `...Chart.tsx` | A data visualization |
| `...Toolbar.tsx` | A row of actions |

### 4.3 No Abbreviations

```
❌ Btn, Nav, Mgmt, Utils, Cfg, Usr, Rx, Enc
✅ Button, Navigation, Management, Utilities, Configuration, User, Prescription, Encounter
```

### 4.4 Props Interface Naming

```typescript
// ✅ Correct
export interface DoctorPrescriptionItemRowProps { ... }
export interface BillingInvoiceLineItemTableProps { ... }

// ❌ Forbidden
export interface Props { ... }
export interface Data { ... }
```

---

## 5. Rule 4 — Theme Independence & No Inline Colors

### 5.1 The Canonical Color Pattern

```
1. Define CSS variable in globals.css
2. Map it in tailwind.config.ts
3. Use Tailwind class name in JSX
```

```css
/* globals.css */
:root {
  --color-primary-teal: #0D9488;
  --color-dark-teal: #0F766E;
  --color-emerald-green: #059669;
  --color-light-teal-bg: #F0FDFA;
  --color-dark-slate: #0F172A;
  --color-alert-crimson: #E11D48;
  --color-warning-amber: #F59E0B;
  --color-info-blue: #0EA5E9;
  --color-purple-accent: #7C3AED;
  --color-bg-grey: #F8FAFC;
  --color-white-card: #FFFFFF;
  --color-slate-700: #334155;
  --color-slate-400: #94A3B8;
  --color-vital-normal: #059669;
  --color-vital-abnormal: #F59E0B;
  --color-vital-critical: #E11D48;
  --color-ai-generated: #7C3AED;
}
```

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      'primary-teal':    'var(--color-primary-teal)',
      'dark-teal':       'var(--color-dark-teal)',
      'emerald-green':   'var(--color-emerald-green)',
      'light-teal-bg':   'var(--color-light-teal-bg)',
      'dark-slate':      'var(--color-dark-slate)',
      'alert-crimson':   'var(--color-alert-crimson)',
      'warning-amber':   'var(--color-warning-amber)',
      'info-blue':       'var(--color-info-blue)',
      'purple-accent':   'var(--color-purple-accent)',
      'bg-grey':         'var(--color-bg-grey)',
      'white-card':      'var(--color-white-card)',
      'slate-body':      'var(--color-slate-700)',
      'slate-hint':      'var(--color-slate-400)',
      'vital-normal':    'var(--color-vital-normal)',
      'vital-abnormal':  'var(--color-vital-abnormal)',
      'vital-critical':  'var(--color-vital-critical)',
      'ai-generated':    'var(--color-ai-generated)',
    }
  }
}
```

```tsx
// ✅ Correct in JSX
<div className="bg-light-teal-bg text-dark-slate border border-primary-teal">

// ❌ Forbidden in JSX
<div className="bg-[#F0FDFA] text-[#0F172A] border-[#0D9488]">
<div style={{ backgroundColor: '#F0FDFA' }}>
```

### 5.2 Theme Contract (Per Module)

Every module folder MUST contain a `[moduleName]_theme_contract.md`:

```markdown
# Reception Module — Theme Contract
CSS Variables consumed by this module:
- --color-primary-teal    (active queue token, CTA buttons)
- --color-emerald-green   (check-in success badge)
- --color-alert-crimson   (overdue token, no-show badge)
- --color-warning-amber   (waiting time warning)
- --color-dark-slate      (section headers)
- --color-bg-grey         (page background)
- --color-white-card      (patient cards)
- --color-info-blue       (ABHA badge)
```

---

## 6. Rule 5 — State Management Decision Boundary

### 6.1 The Canonical Decision Matrix

```
                    ┌─────────────────────────────────────┐
                    │         WHERE DOES THIS STATE GO?    │
                    └─────────────────────────────────────┘
                                        │
              ┌─────────────────────────┼───────────────────────────┐
              │                         │                           │
     Is it server/async?      Is it shared across          Is it strictly private
     (API data, loading,      multiple components           to ONE component?
      error states)           in this module?
              │                         │                           │
              ▼                         ▼                           ▼
      TanStack Query           Zustand module-scoped        Local useState
      (ONLY owner of           store ([module].store.ts)
       server state)
              │
    React Context ONLY for:
    - Theme (dark/light)
    - Sidebar open/close
    - Locale / language
    Never for API data.
```

### 6.2 Zustand Store Rules

- One store per module role: `reception.store.ts`, `doctor.store.ts`
- Store only UI-state: active filters, selected rows, wizard step, table preferences, local draft
- Never store API response data — TanStack Query owns that
- Max 180 lines per store file; split if exceeded

### 6.3 React Context Rules

- Context MUST use `useMemo` on the value object to prevent re-render cascades
- `useCallback` on all function references passed through context
- Never put `isLoading`, `data`, `error` from API calls in Context

---

## 7. Rule 6 — Logic vs. UI Separation (Custom Hooks)

Every non-trivial component MUST have a sibling `use[ComponentName].ts` file:

```
ReceptionPatientSearchBox.tsx        ← Pure JSX "View" layer
useReceptionPatientSearch.ts         ← All useEffect, useState, transformation logic
```

**The `.tsx` file must only:**
- Call the hook: `const { results, isLoading, onSearch } = useReceptionPatientSearch()`
- Render JSX consuming the hook's return values
- Contain zero business logic, zero `useEffect`, zero data transformations

**The `use*.ts` file must contain:**
- All `useEffect`, `useCallback`, `useMemo`
- TanStack Query hooks (`useQuery`, `useMutation`)
- Data transformation / formatting
- Event handlers and derived state

---

## 8. Rule 7 — Interface & Type Isolation

### 8.1 Directory Structure for Types

```
[module]_types/
├── [module].api.generated.ts   ← Generated from OpenAPI (never hand-edit)
├── [module].schema.ts          ← Zod schemas for API boundary validation
├── [module].types.ts           ← Domain types, UI state types, prop interfaces
└── [module].constants.ts       ← All hardcoded data arrays + derived types
```

### 8.2 No Inline String Union Types

```typescript
// ❌ Forbidden: inline string literal union
interface ReceptionAppointmentCardProps {
  status: 'booked' | 'checked_in' | 'in_consultation' | 'completed' | 'no_show';
}

// ✅ Required: named type in _types.ts
// reception_types/reception.types.ts
export type AppointmentStatus =
  | 'booked'
  | 'checked_in'
  | 'in_consultation'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface ReceptionAppointmentCardProps {
  status: AppointmentStatus;
}
```

### 8.3 Hardcoded Data → Constants File

```typescript
// ❌ Forbidden: hardcoded options inline in JSX
<Select options={[
  { label: 'Cash', value: 'cash' },
  { label: 'Card', value: 'card' },
  { label: 'UPI', value: 'upi' },
]} />

// ✅ Required: in billing_types/billing.constants.ts
export const PAYMENT_MODE_OPTIONS = [
  { label: 'Cash', value: 'cash' },
  { label: 'Card (POS)', value: 'card' },
  { label: 'UPI', value: 'upi' },
  { label: 'NEFT/RTGS', value: 'neft' },
  { label: 'Insurance', value: 'insurance' },
] as const;

export type PaymentMode = typeof PAYMENT_MODE_OPTIONS[number]['value'];
```

---

## 9. Rule 8 — TypeScript Strictness & Zod Runtime Validation

### 9.1 tsconfig.json Must Include

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUncheckedIndexedAccess": true,
  "verbatimModuleSyntax": true
}
```

### 9.2 Forbidden Patterns

```typescript
// ❌ Never use `any`
const patientData: any = await fetchPatient(id);

// ✅ Use `unknown` + Zod parse
const raw: unknown = await fetchPatient(id);
const patientData = ReceptionPatientSchema.parse(raw);

// ❌ Never suppress type errors
// @ts-ignore
// @ts-nocheck

// ❌ Never consume raw API responses without Zod parse
const res = await api.get('/patients');
setPatients(res.data); // ← FORBIDDEN

// ✅ Always parse at API boundary
const res = await api.get('/patients');
const patients = ReceptionPatientListSchema.parse(res.data);
setPatients(patients);
```

### 9.3 API Boundary Validation Enforcement

- All API service files (`*.api.ts`) must parse responses with Zod before returning
- Zod schemas live in `[module]_types/[module].schema.ts`
- OpenAPI-generated types live in `[module]_types/[module].api.generated.ts` (read-only)
- Domain/UI types live in `[module]_types/[module].types.ts`

---

## 10. Rule 9 — `"use client"` Directive

Next.js App Router defaults to Server Components.

```typescript
// ✅ REQUIRED on line 1 for ANY component using:
"use client";
// - useState
// - useEffect
// - useCallback / useMemo
// - TanStack Query hooks
// - Zustand store
// - Event handlers (onClick, onChange, etc.)
// - Context consumers

// Server Components (no "use client") may ONLY:
// - Fetch data directly (async component)
// - Pass data as props to Client Components
// - Render static/server-rendered HTML
```

---

## 11. HMS-Specific Compliance Rules (Non-Negotiable)

These apply ON TOP of the architecture rules above:

### 11.1 Aadhaar Masking (DPDP Act 2023)
- **NEVER** display, log, or pass unmasked Aadhaar in any UI component, state, or API payload
- Input mask: `XXXX-XXXX-[####]` — only last 4 digits visible
- Field display: Always render as `XXXX-XXXX-1234`
- Store field name must be `aadhaar_masked`

### 11.2 AI-Generated Clinical Content
- Every AI-drafted SOAP note, prescription suggestion, or diagnosis must render with:
  ```tsx
  <HmsAiGeneratedBadge />  // Purple badge "AI Draft — Needs Review"
  ```
- The "Sign" / "Finalize" button must remain DISABLED until a physician explicitly edits or confirms
- `signed_by` and `signed_at` fields must only be set after explicit physician action

### 11.3 Prescription & Clinical Finalization
- Prescription print is BLOCKED until `signed_at` is not null
- Discharge summary must have `signed_by` (doctor UUID) before PDF generation
- Encounter close action requires PIN/biometric confirm on mobile

### 11.4 Consent Artefact Display
- Any screen sharing patient data to a third party must show the active consent artefact ID
- DPO screens showing consent lists: read-only, no edit/delete buttons ever rendered

### 11.5 Audit Log UI
- Audit log tables have zero edit/delete controls — append-only display
- Any filter/export action on audit logs must itself be logged

### 11.6 Multi-Tenancy in Frontend
- JWT token is the ONLY source of `tenant_id` and `hospital_id`
- Never read `tenant_id` or `hospital_id` from URL params for security-sensitive operations
- Never display raw UUIDs for tenant/hospital in patient-facing UI

---

## 12. Core Pages to Scaffold (Phase 1 Priority Order)

1. `/auth/login` — Staff and doctor authentication + MFA
2. `/reception/registration` — Patient UHID registration (3-step wizard) + ABHA linkage
3. `/reception/appointments` — OPD queue management + token generation
4. `/doctor/dashboard` — Doctor appointment queue + active encounter chart
5. `/doctor/encounter/[id]` — 3-pane clinical SOAP notes + ICD-10 + eRx builder
6. `/billing/invoices` — GST invoice generator + payment collection
7. `/pharmacy/dispense` — Prescription dispensing + FEFO batch verification

---

## 13. i18n & Language Fallback Policy

- System primary language: English (`en`)
- Hindi (`hi`) + regional fallbacks: patient portal and all print templates
- All display strings use i18n keys — never hardcode English strings directly in JSX
- Date format: `DD/MM/YYYY` · Time: `12h AM/PM` · Currency: `₹ INR`

---

## 14. Print Templates Rules

- Prescriptions, invoices, lab reports, discharge summaries render via `print_templates` DB table
- HTML layout supports A4 (210×297mm) and thermal receipt (80mm width)
- All print template components live in `src/components/print/` (shared UI, not business)
- Variable interpolation: `{{patient.name}}`, `{{doctor.signature_url}}`, `{{invoice.gstin}}`

---

## 15. PWA & Offline Capability

- `"use client"` components that need offline support use IndexedDB via `idb` library
- Offline-capable screens: Nurse vitals entry · MAR administration · Nursing notes
- Offline banner: `<HmsOfflineBanner />` renders automatically when `navigator.onLine === false`
- Sync queue: local records show "Pending Sync" badge until confirmed by server

---

*Last updated: 2026-09-08 | Version: 2.0.0*
*This file is the single source of truth for all frontend AI agent rules.*
