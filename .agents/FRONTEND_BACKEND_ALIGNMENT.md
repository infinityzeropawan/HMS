# HMS Frontend ↔ Backend Alignment

Use whenever a page or action depends on backend behavior.

## Contract-first rule
Locate the existing API/service/controller/schema/DTO before wiring a backend-dependent change. Do not invent endpoints from the UI specification alone.

## Required trace
1. UI entry point
2. Hook/store/client function
3. API endpoint
4. Controller/service
5. Validation and authorization
6. Persistence/model
7. Returned DTO and state update
8. Audit event
9. Error mapping

## Status labels
- UI_ONLY — interaction without persistence
- DEMO_DATA — hard-coded/mock/seeder data
- API_CONNECTED — frontend calls a real backend contract
- PERSISTED — mutation reaches real storage
- BLOCKED — required backend contract/dependency is missing or unusable

## Mutation checks
- Loading before submit
- Client validation
- Server validation/error mapping
- Duplicate-submit prevention
- Success state
- Store/cache invalidation or refresh
- Required audit event
- Tenant/hospital authorization
- Optimistic updates only when safe

## Read checks
- Correct tenant/hospital scope
- Backend-compatible filter/sort/pagination
- Empty state
- Loading skeleton
- Retry/error state
- Response normalization
- No assumptions about undocumented response fields

## Clinical workflows
Prescription, lab orders, clinical notes and similar artifacts must keep draft and signed/final states separate and require explicit sign-off.

## Compliance
- Aadhaar masked in UI
- Consent verified before applicable sharing
- Audit events append-only
- Backend authorization remains authoritative
- Tenant/hospital scope server-verified

## Reporting
When backend support is absent, document the exact missing contract and keep the UI honest. Never fabricate successful persistence.