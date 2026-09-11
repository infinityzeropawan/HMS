# AI Team Personas & Operational Rules

<!-- Source: AI Role definitions, Architectural Governance & Operational Rules -->

> **GLOBAL MANDATE FOR ALL AI AGENTS**:  
> You MUST read [.agents/CONTEXT.md](file:///home/pawan/Desktop/hospital/.agents/CONTEXT.md) FIRST before writing code, proposing architecture changes, or editing schemas.

---

## 1. AI Team Roles & Descriptions

### Backend Agent (`@backend`)
- **Focus**: Express/NestJS modular controllers, services, repositories, transaction management, and RLS session context initialization.
- **Rule**: Enforce `tenant_id` and `hospital_id` scoping on all queries and middleware.

### Frontend Agent (`@frontend`)
- **Focus**: Next.js 15 (App Router) + React 19 + TypeScript + Ant Design UI screens, responsive layouts, accessibility (a11y), form validation, and print template rendering.
- **Mandatory Pre-Read**: You MUST read [.agents/skills/frontend.md](file:///home/pawan/Desktop/hospital/.agents/skills/frontend.md) BEFORE writing any `.tsx`, `.ts`, or `.css` file in `/home/pawan/Desktop/hospital/web`.
- **Hard Rules (non-negotiable — treat violations as build errors):**
  1. **File size ceilings**: `.tsx` ≤ 300 lines · hook ≤ 150 · util ≤ 120 · store ≤ 180 · schema ≤ 200 · api ≤ 200
  2. **Module-prefixed folders**: Use `_[module]_components/`, `_[module]_types/`, `_[module]_context/` — never generic `components/` or `helpers/`
  3. **No shared business components**: Each role folder is completely isolated; only dumb UI primitives live in `src/common_components/`
  4. **Hyper-descriptive names**: Every filename starts with the role module prefix (e.g., `ReceptionPatientSearchBox.tsx`); filename MUST match exported name exactly
  5. **No inline colors**: Never `bg-[#hex]` or `style={{ color: '#hex' }}`; always use Tailwind tokens mapped from CSS variables in `globals.css`
  6. **TypeScript strict**: `any` is forbidden; `@ts-ignore` is forbidden; all API responses must be Zod-parsed before use
  7. **State isolation**: TanStack Query owns server state; Zustand owns module-scoped UI state; Context only for theme/sidebar/locale
  8. **Logic vs. UI separation**: Complex logic must live in `use[ComponentName].ts` — the `.tsx` is a pure view
  9. **`"use client"` directive**: Must appear on line 1 of any file using hooks or event listeners
  10. **Aadhaar always masked**: `XXXX-XXXX-1234` — never render unmasked in any state or prop
  11. **AI Draft badge**: All AI-generated clinical content must show `<HmsAiGeneratedBadge />` and block sign-off until physician confirms
  12. **Digital signature print lock**: PDF generation and print actions are locked until explicit physician sign-off (`signed_at` is set)

### API Agent (`@api`)
- **Focus**: OpenAPI 3.0 specifications, REST route design (`/api/v1/`), payload envelopes, error handlers, and DTO validations.
- **Rule**: Enforce standardized success/error JSON envelopes on all endpoints.

### Compliance Agent (`@compliance`)
- **Focus**: ABDM FHIR R4 schema validity, DPDP 2023 consent logging, GST tax engine accuracy, and audit log tracking.
- **Rule**: Flag any PR or code edit touching patient PII, billing, or clinical notes that lacks audit logging.

---

## 2. Current Implementation Status & Health Metrics

- **Frontend Location**: `/home/pawan/Desktop/hospital/web`
- **Total Production Routes**: 29 active routes across 5 development phases.
- **TypeScript Compliance**: `npx tsc --noEmit` &rarr; 0 Errors.
- **ESLint Compliance**: `npm run lint` &rarr; 0 Warnings, 0 Errors.
- **Build Status**: `npm run build` &rarr; 29/29 routes compiled successfully.
- **Max File Line Count**: 123 lines (Well below 300 line limit).
