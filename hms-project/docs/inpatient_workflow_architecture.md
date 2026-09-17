# Inpatient Care Workflow Architecture

## Status

**Required for production — not yet implemented.** The current web routes are UI prototypes backed by fixture data and browser storage. They must not be used as a clinical system of record.

## Care pathways

### OPD consultation

Reception registers or identifies the patient, creates an appointment/token, and assigns it to a doctor queue. The doctor opens the encounter, records notes, signs the prescription, and sends the order to pharmacy. An OPD encounter does not create an admission, a bed assignment, or a nursing MAR.

### IPD admission and placement

The admitting doctor initiates an admission request. An authorised admission desk or nursing supervisor selects an available bed and confirms placement. The server performs one atomic transaction that creates the admission, creates the active bed occupancy, changes the bed state to `occupied`, writes an audit record, and publishes `admission.placed`.

### Bed transfer

Bed configuration belongs to Hospital Admin; operational placement and transfer belong to the admission desk/nursing supervisor. A staff nurse may request a transfer but cannot unilaterally move a patient. The receiving ward nurse acknowledges the transfer when the patient arrives. The command must lock both bed rows, close the old occupancy, open a new occupancy, update the admission's current bed, append an immutable transfer record, and publish `bed.transfer.completed`. A bed is never inferred from a display label.

### Ward care and rounds

The nurse station queries active occupancies for the nurse's assigned ward and shift. Selecting a bed opens the current admission chart: patient identity, allergies, active orders, due MAR tasks, latest vitals, nursing notes, and handover. Doctors use the same active occupancy list to select a ward/room/bed during rounds, then write a dated round note or sign orders against that admission. Both roles see the same server data, scoped by hospital and authorised ward.

### Inpatient medication orders and MAR

When a doctor signs an **inpatient** medication order, the server creates versioned order items and scheduled administration tasks. Each task resolves the active bed/ward and responsible shift at read time, so a bed transfer sends the task to the receiving ward without altering its clinical history. The nurse records `given`, `held`, `refused`, or `missed`, with time, user, reason, and barcode/override evidence. Only a doctor can prescribe, modify, or discontinue an order; only an authorised nurse can administer it.

## Authoritative data model

Keep `admissions`, `bed_transfers`, `nursing_notes`, `medication_administration_records`, and `shift_handovers`. Add or formalise:

| Record | Purpose |
|---|---|
| `rooms` | Physical room within a ward; beds belong to a room. |
| `bed_occupancies` | Time-bounded authoritative patient-to-bed assignment (`admission_id`, `bed_id`, `started_at`, `ended_at`, status). One active occupancy per bed and admission. |
| `ward_staff_assignments` | Nurse-to-ward/shift responsibility, used for nurse-station visibility and alerts. |
| `clinical_orders` / `clinical_order_items` | Signed, versioned IPD medication, lab, diet, and care orders linked to an admission. |
| `mar_schedule_tasks` | Individual due administrations generated from signed medication orders. |
| `ward_round_notes` | Doctor round assessment, plan, author, and sign-off time. |
| `clinical_event_outbox` | Transactional outbox for reliable real-time updates and notifications. |

Every record carries `tenant_id`, `hospital_id`, author, creation time, and audit metadata. Use database constraints/indexes to enforce one active occupancy per bed and one active placement per admission. All change commands run in a database transaction under RLS; no client may write or derive occupancy state.

## Required service boundaries and events

The NestJS backend must implement Admission/Bed Management, Nursing, Clinical Orders, and Notification modules. After the transaction commits, the outbox publishes events such as `admission.placed`, `bed.transfer.completed`, `vitals.recorded`, `order.signed`, `mar.due`, `mar.recorded`, and `round.note.signed`. WebSocket/SSE consumers invalidate TanStack Query data for the affected ward, admission, doctor, and assigned nurse. Notifications are generated server-side; Zustand is presentation state only.

## Safety and authorization rules

- A signed prescription/order is immutable; amendments create a new version and preserve the original.
- MAR administration requires the active order, active admission, staff/shift authorization, and an auditable outcome; late or duplicate doses require reason/override handling.
- Discharge, death, DAMA, and transfer-out close the active occupancy and cancel/reconcile future MAR tasks atomically.
- Doctor, nurse, reception, pharmacy, and admin views use APIs—not `localStorage` or seeded fixtures—for clinical state.
- Server-side RBAC/RLS and append-only audit logs are mandatory for all patient, medication, and bed changes.

