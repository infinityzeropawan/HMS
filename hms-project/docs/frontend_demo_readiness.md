# Frontend Demo Readiness Audit

## Scope and verdict

**Audit date:** 12 September 2026  
**Scope:** current Next.js frontend only, compared with `india_paperless_hospital_blueprint.md` and `inpatient_workflow_architecture.md`.

The application is a polished **interactive UI prototype**, not an end-to-end hospital system. It is suitable for a design, UX and workflow-concept demonstration when every presenter states that data is simulated in the browser. It is not suitable for a live clinical, billing, compliance, ABDM, pharmacy, or multi-user demonstration.

The repository has no executable NestJS backend source. Most data is fixture data, component state, Zustand seed data, or browser `localStorage`. Browser storage is isolated per browser/profile, can be changed by the user, and is not an auditable clinical system of record.

## Status definitions

| Status | Meaning |
|---|---|
| **Demo interaction** | The UI accepts input, validates or changes visual state inside one browser. |
| **Simulated persistence** | The action writes to browser `localStorage`; it may survive refresh in that browser only. |
| **Static UI** | The screen displays fixture data or a success message without creating a connected record. |
| **Not present** | No route or usable workflow exists. |
| **Production-ready** | Server transaction, role enforcement, audit record, shared persistence, error handling and test coverage exist. There are currently no production-ready clinical workflows. |

## Journey-by-journey audit

| Architecture capability | Current route / UI | Actual status | Evidence and limitation |
|---|---|---|---|
| Login and role selection | `/login` | Demo interaction | Credentials and JWT are mocked in `auth_api_service.ts`; there is no server authentication or RBAC enforcement. |
| Patient registration | `/patients/register` | Simulated persistence | Wizard validates with Zod and stores a generated UHID in `hms_patients`. Duplicate checks and ABHA linkage are browser-only. |
| Appointment and token | Reception dashboard / registration drawer | Simulated persistence | Writes `hms_appointments` and a token sequence, but the doctor queue reads a different key (`hms_doctor_queue`). The new appointment does **not** appear in the doctor queue. |
| OPD queue actions | `/queue` | Simulated persistence | Call, no-show and completion alter seeded queue records in `hms_doctor_queue`; no appointment/encounter record is updated. |
| Doctor consultation/SOAP | `/encounter/[id]` | Simulated persistence | Draft is local to the browser. It is not linked to the registered patient or an auditable encounter. |
| OPD e-prescription | `/encounter/[id]` | Simulated persistence | Signing writes `hms_encounter_signed`; pharmacy dispatch writes `hms_pharmacy_queue`. |
| Pharmacy dispensing | `/dispense` | Static UI | Dispense table uses its own hard-coded prescriptions and does not read `hms_pharmacy_queue`; FEFO selection and dispensing are visual only. |
| Lab result and panic alert | `/orders` | Simulated persistence | Results are stored in `hms_lab_results`; SMS/panic alert is only a modal/message and no doctor alert is delivered. |
| Patient portal/ABHA | `/portal`, `/gateway` | Static UI | Record access, consent and ABDM/FHIR push are simulated visual flows; no ABDM integration exists. |
| Emergency triage and disposition | — | Not present | There is no dedicated emergency encounter, triage, medico-legal, observation or disposition flow. |
| Admission and bed assignment | — | Not present | There is no admission request, availability check, placement approval, bed occupancy record or deposit/clearance workflow. |
| Ward/room/bed configuration | `/beds` | Static UI / local admin UI | It does not create the authoritative location hierarchy or live availability. Rooms are not modelled in the frontend flow. |
| Live ward/ICU board | `/station`, `/wards` | Static UI | Bed board and IPD patient cards are hard-coded. They do not represent admission state and cannot be filtered by responsible nurse/shift. |
| Bed transfer | — | Not present | No transfer request, receiving-ward acceptance, reason, occupancy history, audit or notification exists. |
| Nurse patient chart | `/station`, `/mar/[ipdId]` | Static UI | The chart is fixed to Sunil Verma / ICU-01 regardless of selected patient. There is no route from a chosen bed to a patient-specific chart. |
| Vitals and nursing notes | `/station` | Static UI / simulated persistence | Vitals are read from `hms_vitals` but no vitals-entry form exists on the station. Data is not patient-scoped. |
| Nurse handover | `/handover` | Simulated persistence | Handover is stored locally; no ward/shift ownership, acknowledgement workflow or shared visibility. |
| Medication administration record | `/mar/[ipdId]` | Simulated persistence | Dose changes write a single `hms_mar` key, not a patient/admission-specific MAR. Barcode verification is simulated and orders do not generate doses. |
| Doctor ward rounds | `/wards` | Static UI | IPD cards only offer discharge summary. There is no doctor bed-round list, round note, order entry against admission, or ward alert view. |
| Doctor order → nurse worklist | — | Not present | No order service, schedule task, nurse/ward assignment, real-time update or acknowledgement exists. |
| OT and anaesthesia | `/schedule` | Static UI | Booking/clearance display is demonstrative; no patient, consent, implant, recovery or charge linkage. |
| Discharge | `/discharge/[ipdId]` | Demo interaction | Form validation, signing and print lock work visually, but summary is not persisted; admission, medication reconciliation, billing clearance and bed release are absent. |
| Billing/TPA | `/invoices`, `/claims` | Simulated persistence / static UI | Invoice creation uses local storage. Clinical charges, admission billing, payer authorisation and claim status are not connected. |
| Audit and notifications | `/audit-logs`, `/notifications` | Static UI | Audit data and notifications are seeded. No immutable server audit trail, delivery, subscription or real-time event exists. |
| Multi-user, multi-branch and offline sync | Multiple screens | Not present | No API/backend, conflict detection, authenticated event stream or reliable offline replay exists. |

## Cross-flow integrity checks

These are the most important checks for an audience evaluating hospital operations:

| Expected connection | Result today | Demo impact |
|---|---|---|
| Registration → appointment | Partial | A patient can be manually typed into the booking form; there is no server search/selection from the new registry. |
| Appointment → doctor queue | Broken | A newly booked token is not visible to the doctor because the two screens use different local-storage keys. |
| Doctor encounter → pharmacy | Broken | The prescription writes `hms_pharmacy_queue`, while pharmacy displays a hard-coded list. |
| Doctor inpatient order → nurse MAR | Missing | There is no IPD order path or shared scheduler. |
| Admission → ward bed board | Missing | Admission does not exist; occupancy is hard-coded. |
| Bed transfer → nurse/doctor worklists | Missing | There is no transfer workflow or active occupancy source. |
| Nurse vitals/MAR → doctor review | Missing | Local keys are not patient/admission scoped and doctor screens do not query them. |
| Discharge → bed released / billing / patient portal | Missing | Discharge is a visual form only. |
| Lab critical result → assigned doctor/nurse | Missing | A success/modal message is not a delivered clinical alert. |

## What can be demonstrated honestly today

Use this as the presentation sequence and label the product **“HMS Frontend Prototype / UX Demo”** on the opening slide or screen.

1. Log in with a role-specific demo account and show responsive navigation, language/high-contrast options, mobile nav and role modules.
2. Register a sample patient and show the field validation, masked Aadhaar presentation and generated sample UHID.
3. Open the appointment drawer and show token generation. Do **not** claim the token reaches the doctor queue automatically.
4. Open the doctor queue and consultation workspace to demonstrate queue interaction, SOAP draft, prescription composition, signature lock and print-lock UX.
5. Open pharmacy, lab, nursing, MAR, handover, wards, OT and discharge screens as separate workflow designs. State that these use curated demo records.
6. Demonstrate responsive mobile layouts, tables/cards, status cues, validation messages and clinician-facing safety prompts.

## Claims that must not be made in the demo

- “The system is paperless/end-to-end/live.”
- “This is ABDM integrated/certified,” “FHIR has been sent,” or “ABHA has been linked.”
- “A barcode was verified,” “an SMS was sent,” or “the doctor/nurse was notified.”
- “The prescription reached pharmacy,” “the doctor order reached the nurse,” or “the bed transfer updated the ward.”
- “The system has secure RBAC, real audit logs, RLS, multi-tenancy, backup, offline sync or DPDP/NABH compliance.”
- “The generated discharge summary, invoice, medical record or controlled-drug record is legally authoritative.”

## UX fixes required before a stronger prototype demo

These can be added in a separate **Demo Mode** without representing them as production functionality:

1. Use one clearly labelled in-browser demo store so registration → appointment → queue → encounter → pharmacy appears connected.
2. Add a synthetic admission flow: select patient, ward, room and vacant bed; then render the active placement consistently on the ward board.
3. Add a demo-only transfer dialog with visible history and a banner stating “Simulated — not a clinical record.”
4. Route doctor ward rounds from a bed card to a patient-specific read-only chart, then demonstrate an inpatient order appearing in that patient's demo MAR.
5. Add a Demo Reset action that clears all browser demo data and restores deterministic sample records.
6. Make every simulated service action visually explicit: `Simulated notification`, `Demo data`, `Not connected to ABDM`, `Not sent to pharmacy`.

Do not add those connections using scattered `localStorage` keys. If a demo mode is built, centralise it in one typed store and keep it explicitly separate from the future API implementation.

## Minimum implementation gate for operational claims

Before moving from “UX demo” to “functional pilot,” implement Release 0 and Releases 1–2 from `india_paperless_hospital_blueprint.md`: backend/API, PostgreSQL with tenant/hospital RLS, identity/RBAC, audit/outbox, patient access/OPD, then ADT/bed occupancy/nursing. Only then connect medication, diagnostics, pharmacy and discharge. A production go-live additionally needs clinical governance, security, legal/compliance, data migration, testing and hospital-led pilot approval.
