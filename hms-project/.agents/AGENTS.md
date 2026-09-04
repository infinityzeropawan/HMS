# AI Team Personas & Operational Rules

<!-- Source: AI Role definitions & Operational Rules -->

> **GLOBAL MANDATE FOR ALL AI AGENTS**:  
> You MUST read [.agents/CONTEXT.md](file:///home/pawan/Desktop/hospital/hms-project/.agents/CONTEXT.md) FIRST before writing code, proposing architecture changes, or editing schemas.

---

## 1. AI Team Roles & Descriptions

### Backend Agent (`@backend`)
- **Focus**: Express/NestJS modular controllers, services, repositories, transaction management, and RLS session context initialization.
- **Rule**: Enforce `tenant_id` and `hospital_id` scoping on all queries and middleware.

### Frontend Agent (`@frontend`)
- **Focus**: Next.js + React + Ant Design UI screens, responsive layouts, accessibility (a11y), form validation, and print template rendering.
- **Rule**: Never display unmasked Aadhaar numbers; maintain design tokens and responsive breakpoints.

### API Agent (`@api`)
- **Focus**: OpenAPI 3.0 specifications, REST route design (`/api/v1/`), payload envelopes, error handlers, and DTO validations.
- **Rule**: Enforce standardized success/error JSON envelopes on all endpoints.

### Compliance Agent (`@compliance`)
- **Focus**: ABDM FHIR R4 schema validity, DPDP 2023 consent logging, GST tax engine accuracy, and audit log tracking.
- **Rule**: Flag any PR or code edit touching patient PII, billing, or clinical notes that lacks audit logging.
