# SKILL: Frontend Architecture — Non-Negotiable Rules & Design Standards

<!-- Source: HMS Frontend Architecture Rules, UI/UX Implementation Plan -->

> **MANDATORY FOR ALL AI AGENTS WRITING FRONTEND CODE**
> These rules are NON-NEGOTIABLE. Violating any of these rules is treated as a hard error, not a warning.
> Read every section before writing a single line of `.tsx`, `.ts`, `.dart`, or `.css` in `/home/pawan/Desktop/hospital/web`.

---

## 0. Quick Reference: What AI Must NEVER Do

| ❌ Forbidden | ✅ Required |
|---|---|
| `any` TypeScript type | `unknown` + Zod narrowing |
| Inline hex colors in JSX: `bg-[#0D9488]` | Tailwind token class: `bg-primary-teal` |
| Hardcoded dropdown/filter data in JSX | Extract to `[module]_constants.ts` |
| Generic folder names: `components/`, `helpers/`, `utils/` | Prefixed module folders: `_reception_components/` |
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

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript (strict mode)
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

### 2.2 Prefixed Module Sub-Folder Structure (CRITICAL)

Never dump micro-files into a single flat directory.
Always group into logically cohesive sub-folders prefixed with a leading underscore and module name:

```
app/(reception)/
├── patients/register/
│   └── page.tsx                              ← Thin Server Component, composes pieces
│
└── _reception_components/
    └── PatientRegistration/
        ├── PatientRegWizard.tsx
        ├── Steps/
        │   ├── DemographicsStep.tsx
        │   ├── ContactStep.tsx
        │   └── VitalsStep.tsx
        └── usePatientRegistration.ts
```

**Prefix rule**: Use `_[moduleName]_components/`, `_[moduleName]_types/`, `_[moduleName]_hooks/`, `_[moduleName]_store/`.

### 2.3 File Size Ceilings (Hard Limits)

| File Type | Max Lines | Verified Max in `web` |
|---|---|---|
| React Component (`.tsx`) | **300 lines** | **123 lines** (`DemographicsStep.tsx`) |
| Custom Hook (`use*.ts`) | **150 lines** | **78 lines** |
| Utility / formatter (`*.utils.ts`) | **120 lines** | **45 lines** |
| Zustand Store (`*.store.ts`) | **180 lines** | **52 lines** |
| Zod Schema / type (`*.schema.ts`, `*.types.ts`) | **200 lines** | **84 lines** |
| API service file (`*.api.ts`) | **200 lines** | **60 lines** |

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
├── (ipd)/           ← IPD Ward team exclusive
├── (pharmacy)/      ← Pharmacist exclusive
├── (lab)/           ← Lab Tech exclusive
├── (billing)/       ← Billing exclusive
├── (analytics)/     ← Hospital Leadership / Analytics
├── (hr)/            ← HR & Payouts
├── (assets)/        ← Biomedical Assets
├── (telehealth)/    ← Encrypted Video Consults
├── (abdm)/          ← ABDM Gateway
├── (cdss)/          ← Clinical Alert System
├── (kiosk)/         ← Self Check-in Kiosk
├── (pacs)/          ← Web PACS DICOM Viewer
├── (network)/       ← Branch Sync & Transfers
└── (patient)/       ← Patient Portal
```

---

## 4. Theme Independence & CSS Variable Tokens

All colors MUST consume defined tokens in `globals.css`:
- `--color-primary-teal`: `#0D9488`
- `--color-dark-teal`: `#0F766E`
- `--color-emerald-green`: `#059669`
- `--color-light-teal-bg`: `#F0FDFA`
- `--color-dark-slate`: `#0F172A`
- `--color-alert-crimson`: `#E11D48`
- `--color-warning-amber`: `#F59E0B`
- `--color-info-blue`: `#0EA5E9`
- `--color-purple-accent`: `#7C3AED`

---

## 5. Compliance Enforcement Rules

- **Aadhaar Masking**: Formatted as `XXXX-XXXX-1234` in UI and stored as `aadhaar_masked`.
- **AI Clinical Drafts**: Display `<HmsAiGeneratedBadge />` and block signature/print until physician sign-off (`signed_at`).
- **GST Invoicing**: 0% GST on healthcare services (SAC 999312), 12%/5% GST on medicines (HSN 3004), exact CGST/SGST split with `NUMERIC(12,2)` precision.
- **Audit Logs**: Immutable log table at `/audit-logs` with zero edit/delete actions.


---

## 6. Mobile-First Responsive Design Rules

### 6.1 Viewport & Meta Requirements (MANDATORY)
Every layout component must include:
```typescript
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#0D9488",
};
```

### 6.2 Responsive Breakpoints (Consistent Usage)
```tsx
// ✅ Correct - Mobile-first responsive classes
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
<div className="p-4 sm:p-6 md:p-8">
<div className="text-base sm:text-lg md:text-xl">

// ❌ Incorrect - Desktop-first or fixed sizes
<div className="w-96"> {/* Fixed width breaks mobile */}
<div className="grid grid-cols-4"> {/* 4 columns on mobile */}
```

### 6.3 Touch-Friendly Components
- **Minimum touch target**: 44×44px
- **Spacing between touch targets**: ≥8px
- **No hover-only interactions**: Mobile has no hover state
- **Visual feedback**: Use `:active` states for touch feedback

### 6.4 Mobile-Specific CSS Requirements
```css
/* Prevent iOS zoom on input focus */
input[type="text"],
input[type="password"],
textarea {
  font-size: 16px;
}

/* Safe area support */
@supports (padding: max(0px)) {
  .safe-area-padding {
    padding-left: max(0px, env(safe-area-inset-left));
    padding-right: max(0px, env(safe-area-inset-right));
  }
}
```

### 6.5 Testing Checklist (Before Commit)
- [ ] Test on 320px viewport (iPhone SE)
- [ ] Test on 375px viewport (iPhone 12/13/14)
- [ ] Test on 768px viewport (iPad portrait)
- [ ] Test on 1024px viewport (iPad landscape)
- [ ] Verify touch targets ≥44×44px
- [ ] Verify no horizontal scrolling
- [ ] Verify form inputs work without zoom issues


---

## 7. Premium UI/UX Healthcare Design System

### 7.1 Mandatory Premium Design Rules
- **Mobile-first**: All components must work perfectly on 360px-430px screens
- **Touch-friendly**: Minimum 44×44px touch targets with ≥8px spacing
- **WCAG 2.1 AA**: All text must have ≥4.5:1 contrast ratio
- **Healthcare context**: Design for emergency situations and clinical workflows

### 7.2 Premium Component Requirements
```tsx
// ✅ CORRECT - Premium mobile-first pattern
<HmsPremiumCard
  title="Patient Queue"
  icon={Users}
  variant="elevated"
  role="doctor"
  compact={isMobile}
>

// ✅ CORRECT - Touch-friendly button
<HmsButton
  size="lg"                    // 48px height
  fullWidth={isMobile}
  loadingText="Processing..."
  className="active:scale-98"  // Touch feedback
>

// ❌ INCORRECT - Fixed sizes, poor contrast
<div className="w-80 text-gray-500"> {/* Fixed width, low contrast */}
<button className="h-8 px-2">       {/* Too small for touch */}
```

### 7.3 Role-Based Interface Standards
Each user role has specific interface requirements:

**Doctor Interface:**
- Primary color: Teal (#0D9488)
- Priority: Patient queue → Encounter workflow
- Mobile pattern: Dashboard → Quick actions → Clinical data

**Nurse Interface:**
- Primary color: Purple (#7C3AED)  
- Priority: Ward rounds → MAR administration
- Mobile pattern: Ward view → Patient → Vitals entry

**Reception Interface:**
- Primary color: Blue (#2563EB)
- Priority: Registration → Appointment scheduling
- Mobile pattern: Search → Register → Token management

**Billing Interface:**
- Primary color: Emerald (#059669)
- Priority: Invoice generation → Payment processing
- Mobile pattern: Invoice → Payment → Receipt

### 7.4 Healthcare-Specific UX Patterns
- **Emergency access**: Critical functions must be immediately accessible
- **Clinical data entry**: Mobile-optimized forms with normal range indicators
- **Medication safety**: Clear warnings for high-risk medications
- **Patient identification**: Multiple verification methods (name, UHID, mobile)

### 7.5 Testing Checklist (Healthcare Specific)
- [ ] Test on 360px screen (iPhone SE equivalent)
- [ ] Verify emergency workflows work offline
- [ ] Check medication calculation accuracy
- [ ] Test with screen reader (clinical data)
- [ ] Verify data persists on app background/close
- [ ] Test barcode/QR code scanning (if applicable)
- [ ] Verify session timeout respects clinical workflows