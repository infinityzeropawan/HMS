
# Patient Journey / UHID Deep-Dive Audit

## 1. Verdict (short)

The journey is **not** end-to-end connected, and **the UHID is not a single master key**:

* A patient registered at reception gets a real UHID in `hms_patients`, but **nothing projects that patient into the stores the doctor and nurse read** → every downstream module resolves unknown UHIDs to one hardcoded demo patient (**P-2026-1049 · Sunil Verma**), including his allergies/high-risk flags.
* There is **no patient search for doctors or nurses** — UHID lookup exists only at reception booking and the kiosk.
* OPD (walk-in) patients can never reach the **lab module**, and nurse flows only exist for admitted (IPD) patients.
* The **OPD consultation charge step is missing**; the IPD discharge invoice marks cash bills **PAID without collecting** and never settles the advance deposit.
* Several routes are orphaned, duplicated or misuse their parameters (encounter ID where a UHID is expected, `/mar/IPD-8801`, `/lab` = `/orders`, `/patient` = `/portal`).

## 2. Patient identity map — five competing stores

| Store / key | Written by | Read by | Behaviour for an unknown UHID |
|---|---|---|---|
| `hms_patients` (localStorage) — **reception registry** | `PatientRegistryService.registerPatient` (`PatientRegWizard.tsx:84`), demo seeder (`hms_demo_seeder.ts:278`) | reception booking drawer, kiosk check-in, `EmrService.getPatientDemographics` (`emr_service.ts:33`) | returns the raw list / `undefined` |
| `hms_patient_master_store_v1` (`usePatientStore`) | **never** — `registerPatient` has **zero callers**; contains exactly **1 seed patient** (`P-2026-1049`) | `PatientProfileService.getPatientProfile/getPatient360`, `PatientContext`, CDSS panels, doctor encounter, `DoctorOrderService`, nurse `Patient360DrawerModal` flags | `getPatient(uhid) → SEED_PATIENTS["P-2026-1049"]` → **“Sunil Verma”, 45/M, O+, highRisk + allergyAlert** (`patient_store.ts:109`) |
| `hms_emr_store_v2` (`useEmrStore`: problems/allergies/medications keyed by UHID) | portal, CDSS writes | EMR snapshot, CDSS interaction checks | falls back to `INITIAL_*["P-2026-1049"]` (`emr_store.ts:211,267,346`) → **every patient inherits Sunil Verma's problems & allergies** |
| `hms_ipd_admissions_store` (`useIpdStore`) | reception “Admit to IPD” (registry UHID ✔) **and** `IpdAdmissionDesk` with hardcoded `P-2026-9912` (`:281`) | nurse station/MAR/orders/fluid/handover, doctor rounds, lab result form, discharge | `admissions[0]` |
| `hms_clinical_encounters_store` + `hms_encounter_signed` | encounter workspace, queue “Complete” | EMR timeline, portal (**not** the Rx vault) | `createBlankEncounter` seeds “Sunil Verma”, DOC-101, dx `I20.9`, 2 drugs (`encounter_store.ts:27-56`) |
| `hms_lab_orders` | `DoctorOrderService.createLabOrder`, `LabResultForm`, PACS | doctor lab inbox, EMR/portal | EMR **fabricates 2 “VERIFIED” results** (`emr_service.ts:146-173`) |
| `hms_billing_master_store_v1` (+ legacy mirror `hms_invoices`) | `addInvoice` (doctor lab/rad, lab form, discharge), `GstInvoiceForm`, deposits | billing dashboard/list/search/dues/refunds, EMR invoices | empty → `INITIAL_INVOICES` |

**Demo identity collision inside the same app:** the same human “Sunil Verma” exists as `P-2026-1049` (registry/appointments) **and** `P-2026-9912` (IPD store, lab specimens, nurse vitals defaults) — there is no mapping table, so the two records can never be joined.

## 3. Hop-by-hop journey trace

| # | Hop | Status | Evidence |
|---|---|---|---|
| 1 | Reception registration → UHID + demographics + triage visit | ✅ | `PatientRegWizard.tsx` → `PatientRegistryService` (collision-safe UHID, duplicate block) |
| 2 | Registration → **doctor/nurse visibility** | ❌ | `hms_patients` is not merged into `usePatientStore`/`useEmrStore` → doctor & nurse see “Sunil Verma” for every new patient (`patient_store.ts:109`, `emr_store.ts:211`) |
| 3 | Booking → OPD token (store, canonical dept IDs, slot conflicts) | ✅ | `AppointmentService.bookAppointment` |
| 4 | Token → doctor queue | ⚠️ | queue maps **all** appointments (any doctor/date), fake wait times, hardcoded vitals (`DoctorQueueTable.tsx:49-69`) |
| 5 | Queue → encounter `/encounter/${uhid}` | ⚠️ | correct UHID from the row, but the sidebar link passes an **encounter ID** (`doctor/queue/page.tsx:146`); nav hardcodes `/encounter/P-2026-1049` |
| 6 | Encounter shows patient identity | ❌ | name/age/flags from `PatientContext`→`usePatientStore` (Sunil Verma fallback); header vitals **hardcoded** (`EncounterWorkspaceLayout.tsx:69-73`) |
| 7 | SOAP / diagnosis / prescriptions captured | ❌ | SOAP only in a global `hms_soap_draft` key; ICD-10 local state; Rx pane local state → the **signed** encounter dispatches the seeded demo dx + 2 demo drugs |
| 8 | Sign → pharmacy | ❌ | writes `hms_pharmacy_queue`, which **no module reads** (pharmacy uses hardcoded `INITIAL_PRESCRIPTIONS`) |
| 9 | Sign → lab orders | ⚠️ | `hms_lab_orders` written with status `PENDING_LAB_PROCESSING`, which is **outside** the doctor inbox's vocabulary (`PENDING_DOCTOR_REVIEW|VERIFIED|CRITICAL_PANIC`) |
| 10 | Lab processes the order | ❌ | the lab module's only surfaces are an **IPD admission-based result form** (`/orders` and `/lab` both render `LabResultForm`, selecting `useIpdStore.admissions`) → **OPD orders are invisible**; no specimen/barcode is created from an order (`addSpecimen` only from the manual queue) |
| 11 | Lab result → doctor inbox | ✅ read / ❌ write-back | inbox reads `hms_lab_orders`; doctor's “sign off” only mutates local state (`LabResultsReviewInbox.tsx:84-92`) |
| 12 | Nurse involvement for OPD patients | ❌ | nurse station/MAR/orders/vitals all key off `useIpdStore` (admitted patients); reception triage vitals never reach the nurse |
| 13 | Nurse → doctor updates | ❌ | MAR/orders/fluid/handover all call `addRoundNote`, which **marks the doctor's ward round COMPLETED** and overwrites the round note (`ipd_store.ts:154-192`) |
| 14 | OPD consultation charge | ❌ | tariff `SRV-CONS-OPD` exists, but no flow creates a consultation invoice; only lab/rad orders auto-invoice |
| 15 | Lab/rad invoice patient identity | ⚠️ | `DoctorOrderService` uses `PatientProfileService.getPatientProfile(uhid).fullName` → invoices/orders can carry **the wrong patient name** (right UHID) |
| 16 | Payment / dues | ⚠️ | `hms_invoices` mirror is written only on `addInvoice`; payments/refunds update only the store → invoice search shows stale status (`billing_store.ts:277`, `:337+`) |
| 17 | IPD discharge → final bill | ⚠️ | bed released ✔, admission DISCHARGED ✔, room invoice created — but cash invoices are marked `PAID` **without collection** and the advance deposit is **never settled** (`AbdmDischargeSummaryForm.tsx:47-79`) |
| 18 | Patient portal / EMR record | ⚠️ | `/portal?uhid=` aggregates demographics (registry-aware), encounters, labs, invoices, admissions, OT, PACS — but **fabricates 2 lab results when none exist**, defaults to `P-2026-1049`, and `/patient` is a duplicate of `/portal` |

## 4. Route integrity (journey-relevant)

**Orphaned / dead**
* `/nurse` — `redirect("/station")` inside a client component + ~180 lines of unreachable JSX (hardcoded KPIs).
* `/patient` — renders `/portal` without redirect (duplicate URL).
* `/reception` — alias of `/dashboard`; `/doctor` — nothing links to it (login goes to `/doctor/queue`).

**Wrong parameters / stale targets**
* `/encounter/ENC-2026-8801` (encounter ID passed where the page expects a UHID) — `doctor/queue/page.tsx:146`.
* `/mar/IPD-8801` in nurse nav and nurse dashboard — no such admission → silently falls back to `admissions[0]` (wrong patient's MAR).
* `/opd/queue` referenced in the super-admin feature catalog — no such route.
* Keyboard shortcuts push every role to `/doctor/queue` and `/dashboard` (reception) even for nurses.

**Duplicated surfaces for the same data**
* `/lab` ≡ `/orders` (both embed `LabResultForm`).
* `/invoices/search` (MOCK + `hms_invoices`) vs `/billing` (store) vs `/invoices` (generator) vs `/billing/billing`… invoice truth is spread over 3 sources.
* `/station` re-embeds `/worklist`, `/vitals` (different component), `/fluid-chart` (different data), `/handover` (different data).
* `/doctor` ≡ `/doctor/queue`; doctor lab inbox ≡ lab module view of the same key.

**Missing routes for the journey**
* No **patient search / lookup by UHID** anywhere for doctor, nurse or billing (only reception booking + kiosk).
* No OPD lab worklist / specimen-creation page; no “orders awaiting collection” screen for lab.
* No OPD consultation-fee collection screen; no deposit-settlement screen at discharge.
* No nurse surface for OPD patients; no “patient 360” route (it exists only as a drawer inside nurse panels).

## 5. UHID integrity findings

| ID | Finding |
|---|---|
| **PT-1** | **UHID is not globally unique/searchable**: created only in the reception registry; the patient module's own generator (`usePatientStore.registerPatient`, random `P-2026-${1000-9999}`) is **never called**, the IPD desk hardcodes `P-2026-9912`, and IPD/lab/nurse fixtures use `P-2026-9912/9944/9978` — overlapping ID spaces with no registry validation |
| **PT-2** | **Silent wrong-patient fallback is systemic**: `usePatientStore.getPatient` → `P-2026-1049`; `useEmrStore` problems/allergies/meds → `P-2026-1049`; `EmrService.getPatientDemographics` → “Sunil Verma”; `usePatientContext` outside a provider → `P-2026-1049`; `Patient360DrawerModal` `uhid` default → `P-2026-9912`; IPD `admissions[0]` fallbacks in MAR/vitals/lab/discharge |
| **PT-3** | Same human has two UHIDs (`P-2026-1049` vs `P-2026-9912`) across modules → records cannot be merged/joined |
| **PT-4** | EMR fabricates clinical data: 2 VERIFIED lab results when none exist (`emr_service.ts:146`), seeded dx + 2 prescriptions on every new encounter (`encounter_store.ts:44-47`), `totalOpdVisits … : 3` (`patient_profile_service.ts:62`), GCS 15 for every vitals row, `pendingOrdersCount = 2` |
| **PT-5** | Ward/role identity drift: `staffId` vs `userId` vs hardcoded names (`DOC-101`, `DOC-102`, ghost `DOC-105/108`) and nurse names not present in the staff master → orders/notes attributed to non-existent clinicians |

## 6. Bug list (severity ordered, all verified)

**Critical — wrong patient / lost care**
1. Newly registered patients are invisible to doctor & nurse; they render as **Sunil Verma** with his allergies and HIGH-RISK flags (PT-2).
2. Queue “Complete” / encounter sign-off dispatches the **seeded** diagnosis and 2 demo drugs to pharmacy/billing instead of what the doctor entered (SOAP/dx/Rx are local-only).
3. MAR/lab/fluid/handover are hardcoded or admission-index-based with `admissions[0]` fallbacks → wrong-patient charting (`mar/[ipdId]/page.tsx:16-18`, `LabResultForm.tsx:19-20`, `NurseMedicationCommandCenter.tsx:25-70`).
4. Nurse actions corrupt the doctor's round state via `addRoundNote` (roundStatus → COMPLETED, note overwritten) and `HandoverForm` writes to `admissions[0]`.
5. Lab results shown to the doctor/patient can be fabricated (EMR fallback) and doctor sign-off is not persisted.

**High — flow breaks**
6. Doctor prescriptions never reach pharmacy (`hms_pharmacy_queue` has no reader).
7. OPD lab orders never reach the lab; no specimen/barcode chain; status vocabulary mismatch.
8. No OPD consultation charge; lab test can be billed twice (doctor order invoice + lab result invoice); discharge invoice marks cash bills PAID without collection and ignores the advance deposit.
9. Payments/refunds don't refresh the `hms_invoices` mirror → stale balances in invoice search.
10. Invoices/lab orders can carry the wrong **patient name** (right UHID) because they resolve names via the fallback profile store.

**Medium — routing/duplication**
11. `/encounter/ENC-2026-8801`, `/mar/IPD-8801`, `/opd/queue`, hardcoded `/encounter/P-2026-1049`; `/nurse` dead page; `/patient` ≡ `/portal`; `/lab` ≡ `/orders`.
12. Tables without scroll wrappers on mobile (`LabResultsReviewInbox:243`, `PrescriptionHistoryVault:182`, `NurseDoctorOrdersWorklist:356`, `NurseMedicationCommandCenter:163`, `NurseVitalsEntryConsole:187`, `NurseFluidBalanceChart:246`) and fixed-width drawers/modals (`Patient360DrawerModal` 640 px, vitals modal 560 px + `grid-cols-3`).
13. Reception triage vitals never surface to nurse or doctor queue (three vaults of vitals instead of one).

## 7. What “correct” looks like (recommendation, not implemented)

1. **One patient master**: make `PatientRegistryService` (over `hms_patients`) the single source; delete the fallback-to-Sunil-Verma behaviour; make `usePatientStore`/`useEmrStore` read the registry by UHID (or migrate them into it), and reconcile the IPD/demo UHIDs to registry UHIDs.
2. **One lookup for every role**: a shared `PatientLookup` component (search by UHID / phone / name) used by doctor queue, encounter, nurse MAR/vitals, lab and billing — with an explicit “patient not found” state instead of a demo fallback.
3. **Order/charge spine**: `encounter order → lab worklist → specimen → result → doctor verification → invoice line` all keyed to the same UHID + orderId, with one invoice per charge code (no double billing), plus an OPD consultation charge and deposit settlement at discharge.
4. **Role-safe writes**: a dedicated MAR/order/fluid/handover store instead of overloading `addRoundNote`.
5. **Route hygiene**: remove/alias duplicates (`/lab`≡`/orders`, `/patient`≡`/portal`, `/nurse`), fix parameter semantics (`/encounter/[uhid]`), and add the missing patient-search route.

## Plan to save this report (needs Act mode)

1. Create `web/src/app/(patient)/PATIENT_JOURNEY_AUDIT_REPORT.md` with the above (identity map, hop-by-hop trace, route integrity, UHID findings, numbered bug list, recommendations).
2. Also write the two reports that were never saved because those turns were in Plan mode: `web/src/app/(doctor)/DOCTOR_SECTION_AUDIT_REPORT.md` and `web/src/app/(nurse)/NURSE_SECTION_AUDIT_REPORT.md`.
3. Verify all three files (`wc -l`, head/tail). *