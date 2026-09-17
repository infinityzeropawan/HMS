# HMS Backend Development Instructions

## 1. Authority and purpose

Build this repository as the authoritative NestJS + Prisma backend for an Indian hospital operations platform. It must replace all browser fixtures and `localStorage` used by the frontend with shared, secure, auditable clinical and operational records.

Read these documents before changing backend code:

1. [`../.agents/CONTEXT.md`](../.agents/CONTEXT.md)
2. [`../hms-project/docs/india_paperless_hospital_blueprint.md`](../hms-project/docs/india_paperless_hospital_blueprint.md)
3. [`../hms-project/docs/inpatient_workflow_architecture.md`](../hms-project/docs/inpatient_workflow_architecture.md)
4. [`../hms-project/docs/api-spec.md`](../hms-project/docs/api-spec.md)
5. The target module's `<module>_backend_feature.md`, if it exists.

These instructions override generic backend templates. Do not build isolated CRUD pages or mock-only APIs. Every feature must fit a connected patient journey and an authoritative server-side record.

## 2. Current state and delivery order

There is currently **no `src/` implementation**. The web app is an interactive frontend prototype; it is not a clinical system of record. Do not claim a workflow is live, ABDM-integrated, paperless, or compliant until the relevant backend release and governance checks are complete.

Build in this order. Do not skip a prerequisite to make a later screen appear functional.

| Release | Backend outcome | Required modules |
|---|---|---|
| 0 — foundation | Service bootstrap, PostgreSQL/Prisma, migrations, tenant/hospital context, JWT auth, RBAC, audit trail, transactional outbox, standard API errors | `platform`, `identity`, `audit`, `outbox` |
| 1 — patient access and OPD | Patient identity/UHID, consent, appointment/token, doctor queue, encounter, signed outpatient prescription | `patients`, `appointments`, `encounters`, `orders` |
| 2 — ADT and nursing | Ward/room/bed master data, admission, live occupancy, transfer, nurse shift assignment, vitals, notes, handover | `locations`, `admissions`, `nursing` |
| 3 — medication, pharmacy and diagnostics | Inpatient orders, MAR tasks, administration, pharmacy verification/dispense, lab/radiology order/result and critical alert | `orders`, `pharmacy`, `diagnostics` |
| 4 — OT, billing and discharge | Procedure/OT records, charge capture, invoice/claim adapters, discharge and reconciliation | `perioperative`, `billing`, `discharge` |
| 5 — integration and quality | ABDM sandbox adapters, FHIR bundles, reporting, quality/incident workflows and production readiness | `integrations`, `quality`, `notifications` |

## 3. Stack and source layout

- Framework: NestJS 10, TypeScript strict mode, ES modules and Nest dependency injection.
- Persistence: Prisma + PostgreSQL. **Do not introduce TypeORM.**
- Validation: `class-validator`/`class-transformer` DTOs at the HTTP boundary; parse all external webhook/integration payloads with a schema before use.
- Authentication: JWT guard plus server-enforced role and location/ward scope. A client role or `X-Tenant-ID` header is never trusted by itself.
- API: REST under `/api/v1`, Swagger/OpenAPI generated from controllers.
- Async work: transactional outbox first; workers consume committed events. Do not send an external notification from inside an uncommitted database transaction.

```text
src/
  main.ts
  app.module.ts
  core/                         # framework plumbing only; never business logic
    config/ context/ auth/ errors/ http/ logging/ prisma/
  modules/
    identity/
    patients/
    appointments/
    encounters/
    locations/
    admissions/
    nursing/
    orders/
    pharmacy/
    diagnostics/
    billing/
    discharge/
    notifications/
    audit/
    integrations/
  prisma/
    schema.prisma
    migrations/
e2e/
```

Each module uses this shape when needed:

```text
modules/admissions/
  admissions_backend_feature.md
  admissions.module.ts
  controllers/
  dtos/
  services/
  repositories/
  domain/
  events/
  policies/
  admissions.constants.ts
  admissions.errors.ts
  admissions.types.ts
  *.spec.ts
```

File names must start with the module prefix and describe one responsibility, for example `admissions-bed-transfer.service.ts`, `nursing-mar-administration.service.ts`, and `orders-inpatient-signing.service.ts`. Keep controllers thin. Do not create `utils`, `helpers`, `common`, or `shared` folders for business logic.

## 4. Core security, tenancy and audit rules

1. Every clinical, financial and operational record includes `tenant_id`, `hospital_id`, `created_by`, `created_at`, `updated_by`, `updated_at`, request/correlation ID and an immutable audit event.
2. Establish authenticated tenant, hospital, user, role and allowed location scope once per request. Apply it to every Prisma query and write. Never accept those fields from the client as authoritative values.
3. PostgreSQL Row-Level Security is mandatory for tenant/hospital isolation. Application filtering is defence in depth, not a substitute for RLS.
4. The audit log is append-only. Record actor, action, entity type/ID, permitted purpose/context, before/after summary, timestamp, source and correlation ID. Never store secrets, passwords, unmasked Aadhaar or full clinical documents inside log payloads.
5. Aadhaar is never stored or returned unmasked unless a documented, legally approved workflow specifically requires it. Default UI/API representation is `XXXX-XXXX-1234`.
6. Clinical records are corrected through addendum/version/amendment; do not silently overwrite signed notes, orders, results or discharge summaries.
7. All state-changing endpoints require authentication, authorisation, audit logging, optimistic version/concurrency checks where relevant, and an idempotency strategy for retryable commands.

## 5. Patient, location and care-setting invariants

### Patient identity

- Generate one durable internal UHID per tenant/hospital policy. ABHA, mobile, government IDs and external MRNs are versioned identifiers with type and verification status, not replacements for the UHID.
- Patient merging, demographic correction and duplicate resolution are privileged, audited workflows. Never silently merge based on a name or phone match.
- An OPD encounter does not create an admission, bed occupancy or MAR.

### Physical location and capacity

- Model `hospital → department → ward → room → bed`. A bed is a physical location; patient name/status must not be stored as mutable display fields on the bed master.
- `bed_occupancies` is the time-bounded authoritative placement: `admission_id`, `bed_id`, `started_at`, `ended_at`, `status`, `placed_by` and transfer references.
- Enforce database constraints/indexes for at most one active occupancy per bed and one active placement per active admission.
- Bed master configuration belongs to Hospital Admin. Operational admission placement and transfer belong to authorised admission desk/nursing supervisor. Bedside nurses may request transfers but cannot silently move patients.

### Admission, transfer and discharge

- `POST /admissions` is an atomic transaction: validate eligibility and bed state; lock the bed; create the admission and active occupancy; update bed availability; write audit/outbox events; commit.
- A transfer locks both beds, closes the prior occupancy, creates the new occupancy, updates current admission placement, preserves an immutable transfer history, writes audit/outbox events and returns the committed state.
- The receiving ward nurse acknowledgement is a separate state transition; it does not alter the historical transfer event.
- Discharge, death, DAMA and transfer-out atomically close active occupancy, reconcile/cancel future MAR tasks, update admission status and emit events. Do not release a bed from a front-end button alone.

## 6. Clinical, nursing and medication safety rules

### Encounters, rounds and notes

- Doctors create/sign assessments, diagnoses, orders, round notes and discharge summaries only within their authorised scope.
- Nurses record assessments, vitals, intake/output, nursing notes, care tasks, handovers and MAR outcomes. Nurses do not prescribe, amend or discontinue medical orders.
- Ward round queries and nurse worklists resolve against the same active occupancy and ward-staff assignment data. A chosen bed opens the patient/admission chart, not a hard-coded patient.

### Orders and MAR

- Model `clinical_orders`, immutable signed order versions/items, and `mar_schedule_tasks`. Distinguish OPD prescription from IPD medication order.
- A doctor signing an inpatient medication order creates schedule tasks only after the transaction succeeds. An amendment/discontinuation creates a new version and reconciles pending tasks while preserving administration history.
- A MAR administration requires: active admission, valid active order/task, nurse/shift/ward authorisation, scheduled/actual times, outcome (`given`, `held`, `refused`, `missed`), reason when not given, and barcode/override evidence where enabled.
- Prevent duplicate administration with a database uniqueness/idempotency rule. Late, early, held or override administration must be explicitly recorded and auditable.
- Resolve the responsible nurse worklist from the current occupancy/ward assignment at read time. A transfer changes who sees pending work; it never rewrites the past clinical record.

### Pharmacy and diagnostics

- Pharmacy verifies/dispenses against a signed order, records pharmacist, batch, expiry, quantity, issue/return and controlled-drug obligations. Dispense never mutates the physician's signed order.
- Lab/radiology orders, collection/accession, verification and critical-result acknowledgement are separate state transitions. Critical-value escalation is a durable event with recipient and acknowledgement, not a success toast.

## 7. API contracts and error behaviour

1. Use `/api/v1` and standard envelopes:

```json
{
  "success": true,
  "data": {},
  "meta": { "timestamp": "2026-09-12T00:00:00.000Z", "correlationId": "..." }
}
```

2. Errors use a stable machine-readable code, safe message, field violations when applicable, timestamp and correlation ID. Use Nest `HttpStatus`, never numeric literals.
3. Paginated lists use a shared documented cursor or offset contract with allowlisted sorting and filters. Lists containing patient data must apply minimum-necessary fields and scope filtering.
4. Document every controller, DTO, response and error with Swagger. Update `../hms-project/docs/api-spec.md` when an endpoint is added or changed.
5. Do not expose internal database IDs, secrets, raw Prisma errors, stack traces, full Aadhaar, security configuration or clinical data beyond the caller's purpose/scope.

## 8. Events, notifications and real-time updates

Use a transactional outbox table written in the same transaction as the state change. Events include:

```text
patient.registered
appointment.booked
encounter.signed
admission.placed
bed.transfer.completed
vitals.recorded
order.signed
mar.due
mar.recorded
diagnostic-result.verified
diagnostic-result.critical
discharge.signed
```

Event handlers must be idempotent. They may create notifications, integration jobs and real-time invalidation messages only after the transaction commits. WebSocket/SSE channels must enforce the same hospital, role and ward scope as REST reads. Zustand and browser notifications are presentation state, never the notification system of record.

## 9. External integrations and paperless controls

- Place ABDM, HFR/HPR, FHIR, NHCX/payer, SMS/email/WhatsApp, LIS, RIS/PACS, payment and object-storage code behind dedicated adapters. Domain services must not call vendor SDKs directly.
- ABDM actions remain explicitly `sandbox`, `pending`, `succeeded` or `failed`; never state that a record was shared/certified without a committed adapter response and traceable consent context.
- Store documents in encrypted object storage with controlled access, metadata, hash/version and retention/legal-hold controls; do not write files to the application container.
- Store integration credentials only in typed configuration/secrets management. No credentials, PHI or test patient data in source control, logs or error messages.

## 10. Coding and testing rules

- TypeScript strict: no `any`, `@ts-ignore`, raw `require()`, `console.log()` or direct `process.env` in business logic.
- Use absolute imports from `@/`. Use Nest dependency injection; do not instantiate repositories/services with `new` inside use cases.
- Keep each controller action and service method focused. Extract transaction orchestration into a named command/orchestrator service; repositories own Prisma queries and services own business rules.
- Co-locate unit tests with the use case/repository. Put API black-box tests in `e2e/`.
- Test every command's happy path, unauthorised cross-tenant access, invalid transition, concurrency/idempotency and audit/outbox result.
- Mandatory high-risk tests: concurrent bed placement/transfer; duplicate MAR dose prevention; signed-order amendment; ward-scope denial; discharge releases bed/reconciles tasks; tenant/hospital RLS denial.
- Run formatting, type checks, unit tests, Prisma migration validation and relevant E2E tests before declaring a feature complete. A compile-only result is not functional verification.

## 11. Required module feature document

Each module must contain `<module>_backend_feature.md` with:

- purpose and records it owns;
- roles/permissions and location scope;
- endpoints, DTOs, state machine and response contracts;
- transaction boundary, constraints and locks;
- emitted/consumed events and adapters;
- audit fields, privacy risks and retention notes;
- test cases and non-obvious safety warnings.

Update this file and the architecture/API documents whenever a material workflow decision changes.

## 12. AI implementation protocol

Before coding, an AI must state the exact module, use case, data ownership, roles, transaction boundary, events, API change and tests. If a request crosses modules, implement the smallest vertical slice with explicit contracts; do not bypass ownership by directly writing another module's tables.

After coding, report: changed files, migration impact, endpoints, authorisation rules, audit/outbox behaviour, tests run and known limitations. If the backend is absent or a dependency cannot be verified, say so plainly; never simulate successful clinical, notification, payment, ABDM or pharmacy actions as if they were real.

## 13. Prohibited shortcuts

- Browser storage, fixture arrays, random IDs or toast messages as a backend substitute.
- Frontend-only authorisation, tenant filtering or audit trails.
- Hard-coded hospital, patient, ward, bed, nurse, doctor, payer or medication values in production paths.
- Silent mutation/deletion of clinical, financial, consent or controlled-drug records.
- Direct database writes from controllers or cross-module repositories.
- External API calls before commit, or emitting an event that has no persisted outbox record.
- Building a new clinical screen/API solely to make a demo look end-to-end.
