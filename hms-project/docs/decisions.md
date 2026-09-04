# Architecture Decision Records (ADRs)

<!-- Source: Extracted Key Design Decisions from architecture blueprint -->

## ADR-001: Multi-Tenancy Strategy — Shared Database with Row-Level Security (RLS)

- **Date**: 2026-09-05
- **Status**: Accepted
- **Context**:  
  We require strong multi-tenant isolation across multi-specialty hospitals and clinics while optimizing infrastructure costs and operational simplicity.

- **Decision**:  
  Utilize a single shared PostgreSQL database instance with a single schema, relying on PostgreSQL **Row-Level Security (RLS)**. Every tenant table MUST include `tenant_id UUID` and `hospital_id UUID` columns.

- **Consequences**:  
  - High tenant density and low operational overhead.
  - Every connection pool checkout must execute `SET LOCAL app.current_tenant_id` and `SET LOCAL app.current_hospital_id`.

---

## ADR-002: Regulatory & Legal Compliance Architecture (ABDM & DPDP 2023)

- **Date**: 2026-09-05
- **Status**: Accepted
- **Context**:  
  Compliance with Ayushman Bharat Digital Mission (ABDM M1, M2, M3) and Digital Personal Data Protection (DPDP) Act 2023 is legally mandatory in India.

- **Decision**:  
  - Internal clinical representations use FHIR R4 JSON standard structures.
  - Digital consent artifacts are logged in `consents` and `consent_artefacts` tables prior to sharing PII.
  - All database PII access must emit entries to partitioned `audit_logs`.

---

## ADR-003: Architecture Strategy — Modular Monolith First

- **Date**: 2026-09-05
- **Status**: Accepted
- **Context**:  
  Microservices introduce heavy network overhead, distributed transaction complexity, and deployment friction during early product iterations.

- **Decision**:  
  Structure the repository as a **Modular Monolith**. Code is partitioned into domain directories (`src/modules/*`) with clear boundaries. Subsystems communicate via TypeScript interfaces and local event buses.

---

## ADR-004: Phase 1 Pragmatic Simplifications (Varchar Masters & Application-Level Tenant Filtering)

- **Date**: 2026-09-05
- **Status**: Accepted
- **Context**:  
  During Phase 1 MVP development, establishing external dictionary foreign keys and connection-pool-level RLS policies introduces unnecessary friction before core clinical workflows (Registration, OPD, eRx, Billing) are verified.

- **Decision**:  
  1. **Varchar Masters for Clinical Entities**: `Diagnosis` (`icd10_code`, `snomed_code`) and `PrescriptionItem` (`drug_name`) will use plain `VARCHAR` fields instead of strict Foreign Keys to `global_masters_*` tables. Linking to global master tables is deferred to Phase 2.
  2. **Application-Level Tenant Isolation**: Session-level Postgres RLS (`SET LOCAL app.current_tenant_id`) does not persist across Prisma's pooled connections outside single transactions. Therefore, Phase 1 relies on **mandatory application-level query filtering** (`where: { tenantId, hospitalId, deletedAt: null }`) on all Prisma operations. Full Postgres RLS enforcement across pooled connections is deferred to Phase 2.
