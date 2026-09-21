I've completed the investigation of the doctor section. Since I'm in **Plan mode**, I can't write the file yet — here is the full report content and the plan to save it. Toggle to **Act mode** and I'll write it to `web/src/app/(doctor)/DOCTOR_SECTION_AUDIT_REPORT.md` (report only, no fixes).

## Plan
1. Create `web/src/app/(doctor)/DOCTOR_SECTION_AUDIT_REPORT.md` with the audit below (route map, D-xx bugs with `file:line` evidence, duplicate/parallel routes, broken links, mobile responsiveness, reception→patient↔nurse↔doctor flow status, fix-priority backlog).
2. Verify the file (`wc -l`, head/tail). No code changes.

---

# Doctor Section Audit (findings summary — to be saved as the report)

## A. Route map & connectivity
- Doctor routes: `/doctor` (dashboard), `/doctor/queue`, `/encounter/[id]`, `/doctor/inpatient`, `/doctor/prescriptions`, `/doctor/lab-results`, `/doctor/schedule`.
- **No duplicate flattened URLs exist** in the whole app (verified `page.tsx` inventory, `uniq -d` empty) — but there are several **orphan / wrong / duplicated-purpose** routes (below).

## B. Routing, wrong links & orphan pages
| ID | Finding | Evidence |
|---|---|---|
| D1 | **Doctor dashboard `/doctor` is orphaned** — no nav entry (sidebar DOCTOR list has queue/encounter/inpatient/Rx/lab/schedule only), login redirect goes to `/doctor/queue` (`auth_redirect.ts:4`); nothing links to `/doctor` | `HmsMobileNav.tsx:69-76` |
| D2 | **Wrong route parameter**: sidebar "Open Active Encounter" links `/encounter/ENC-2026-8801`, but `/encounter/[id]` treats `id` as a **UHID** → opens a workspace for a non-existent patient (falls back to demo "Sunil Verma") | `doctor/queue/page.tsx:146`, `encounter/[id]/page.tsx:9-11` |
| D3 | Nav hardcodes one patient for all doctors: `/encounter/P-2026-1049` | `HmsMobileNav.tsx:71` |
| D4 | Keyboard shortcuts are role-blind and wrong: Ctrl+Alt+S → `/doctor/queue` ("Doctor SOAP Notes"), Ctrl+Alt+P → `/dispense` (pharmacy), Ctrl+Alt+F → `/dashboard` (reception console, labeled "Patient Search") | `HmsKeyboardShortcutsListener.tsx:17-29` |
| D5 | Non-existent route referenced in the feature catalog: `/opd/queue` | `feature_catalog_service.ts:29` |
| D6 | **Encounter workspace bypasses `HmsAppShell`** (own header only) → no sidebar/mobile nav, no logout/bell, and it **bypasses the auth guard** | `EncounterWorkspaceLayout.tsx:40-141` |
| D7 | Duplicated-purpose pages: `/doctor` vs `/doctor/queue` (both render `DoctorQueueTable`); `/doctor/lab-results` vs lab surfaces (`/lab`, `/orders`); `/doctor/inpatient` vs `/ipd`, `/admissions`, `/wards`, `/station`; `/doctor/schedule` vs `/roster`, `/hr/roster`; `/encounter/[id]` vs `/telehealth/consult/[sessionNo]` | route inventory |

## C. Clinical data-flow bugs (patient safety)
| ID | Finding | Evidence |
|---|---|---|
| D8 | Every new encounter is seeded with **wrong patient identity + cardiology data**: "Sunil Verma / 45 / M", DOC-101, dx `I20.9 Angina`, 2 pre-filled prescriptions (Sorbitrate/Ecosprin) | `encounter_store.ts:27-56` |
| D9 | **SOAP notes never reach the encounter**: `SoapPane` writes a single global key `hms_soap_draft` (cross-patient contamination) and never calls `EncounterService.saveDraft`; signing persists an encounter with **empty** complaints/notes | `SoapPane.tsx:8,39-68`; `encounter_service.ts:15-34` |
| D10 | **Prescriptions in the Rx pane are local-only**: seeded with 3 drugs per patient; add/remove never call `EncounterService.addPrescription/removePrescription` → what is dispatched on sign is the store's seeded 2-drug list, not what the doctor prescribed | `PrescriptionPane.tsx:162-166,306` |
| D11 | "Complete" from the queue signs the encounter even if the doctor never opened it → dispatches the seeded dx/meds to pharmacy/billing; also NO_SHOW→store `CANCELLED`, CALLING→store `WAITING` (CALLING is local-only, reverts on refresh → duplicate encounters) | `DoctorQueueTable.tsx:99-115` |
| D12 | Queue is not doctor/date scoped: maps **all** appointments (all doctors, all dates, incl. future) into every doctor's queue; `waitMins` fake (`10+idx*5`); vitals string hardcoded | `DoctorQueueTable.tsx:49-69` |
| D13 | **Encounter header vitals are hardcoded** (BP 130/85, Temp 98.6, Pulse 74) — reception triage vitals and nurse vitals never shown; `PatientContext` has no vitals | `EncounterWorkspaceLayout.tsx:69-73` |
| D14 | Selected ICD-10 diagnoses are local-only (seeded "I20.9") and never synced to the encounter → signed encounter keeps the seeded dx | `DiagnosisPane.tsx:15-30` |
| D15 | Sign side-effects: follow-up books with hardcoded phone, `departmentId:"CARDIOLOGY"` (non-canonical), DOC-101, slot "10:00 AM"; SMS uses category `PATIENT_DISCHARGE` + wrong template key (registered: `TPL_PATIENT_DISCHARGE`) with hardcoded contact; radiology re-dispatched on sign | `encounter_service.ts:111-179` |
| D16 | **Duplicate PACS dispatch**: `handleAddRad` → `DoctorOrderService.createRadiologyOrder` (PACS) and then sign re-dispatches `encounter.radiologyOrders` → each scan enters the PACS worklist twice; removal (`handleRemoveRad`) only edits local state, the removed scan still dispatches on sign | `DiagnosticsOrderPane.tsx:73-107`; `encounter_service.ts:97-109` |
| D17 | `DoctorOrderService.scheduleFollowUp` **always returns success** even when booking fails; hardcodes DOC-101/Cardiology/`10:00 AM` | `doctor_order_service.ts:190-212` |
| D18 | Doctor→pharmacy is **broken**: Rx dispatch writes `hms_pharmacy_queue`, which the Pharmacy module never reads (`PharmacyDispenseTable` uses hardcoded `INITIAL_PRESCRIPTIONS`; store is `hms_pharmacy_master_store`) — prescriptions never reach dispensing; "Send to Pharmacy" + sign also double-dispatch | `PrescriptionPane.tsx:215-231`; `pharmacy_store.ts:648`; `PharmacyDispenseTable.tsx:108` |
| D19 | Silent wrong-patient fallback: `getPatientProfile` returns hardcoded "Sunil Verma" (highRisk+allergy flags) for **any unknown UHID**; same in `usePatientContext` fallback — doctor lab inbox/Rx vault use UHIDs (`P-2026-9912/9944/9978`) that don't exist in the patient registry → another patient's identity is displayed | `patient_profile_service.ts:20-44`; `PatientContext.tsx:100-114`; `LabResultsReviewInbox.tsx:28,40,51`; `PrescriptionHistoryVault.tsx:25,39,52` |
| D20 | Doctor lab sign-off is **not persisted** (local state only) — lab/EMR/pharmacy never learn the result was verified | `LabResultsReviewInbox.tsx:84-92` |
| D21 | Doctor-created lab orders use status `PENDING_LAB_PROCESSING`, which is outside the inbox's status union (`PENDING_DOCTOR_REVIEW|VERIFIED|CRITICAL_PANIC`) | `doctor_order_service.ts:84`; `LabResultsReviewInbox.tsx:19` |
| D22 | Not doctor-scoped: IPD rounds show **all** hospital admissions as "My IPD Bed Count" and expose a "Reset List" that wipes the shared IPD store | `InpatientRoundsWorkspace.tsx:11-20,47,84-88` |
| D23 | Doctor dashboard KPIs are hardcoded ("4 Tokens Active", "3 Patients", "12 e-Rx Today", "1 Lab Panic Alert"); headers hardcode "Dr. Rajesh Sharma" regardless of session user (dashboard `:37`, queue `:47`) | `doctor/page.tsx:65,78,89,102` |
| D24 | Queue sidebar "Today's Schedule" is a fake hardcoded list (Priya Mehta, Dinesh Bhatia, Kavita Singh exist nowhere) | `doctor/queue/page.tsx:10-17` |
| D25 | "e-Prescription Vault" is 100% hardcoded demo data — never reads `hms_encounter_signed`, so real signed Rx never appear | `PrescriptionHistoryVault.tsx:21-62` |
| D26 | Follow-up modal: UTC date bug (`toISOString`), `selectedDate` seeded once (stale on reopen), past dates accepted via `Math.abs` | `FollowUpModal.tsx:57-75` |
| D27 | Schema drift: `EncounterSchema` uses `patientUhid`/`isAiSuggested` (not on `ClinicalEncounter`), a narrower `frequency` enum than the UI's `FREQ_OPTIONS` (missing BD/TDS/0-1-0/1-1-0/0-1-1), and is never used to validate signing | `encounter_schema.ts:3-26` vs `encounter_types.ts:5-12`, `PrescriptionPane.tsx:33` |
| D28 | `useDoctorIpdStore` is dead code (component uses `useIpdStore` directly) with an `as any` getState hack | `doctor_ipd_store.ts:50-68` |
| D29 | No i18n anywhere in the doctor section (`useI18n` unused) — language switcher has no effect | doctor section wide |
| D30 | Fake data in services: `totalOpdVisits = … : 3`; hardcoded prescriber "Dr. Rajesh Sharma (Cardiology)" in CDSS overrides and PACS dispatch | `patient_profile_service.ts:62`; `PrescriptionPane.tsx:321`; `doctor_order_service.ts:150` |

## D. Mobile responsiveness (doctor section)
| ID | Finding | Evidence |
|---|---|---|
| M1 | Lab inbox `<Table>` (6+ cols) has **no `scroll={{x}}` and no overflow wrapper** → horizontal overflow on phones | `LabResultsReviewInbox.tsx:243` |
| M2 | Same for the Rx vault table | `PrescriptionHistoryVault.tsx:182` |
| M3 | Encounter layout: `min-h-screen lg:h-screen` + `lg:overflow-hidden` + panes `h-[calc(100%-1rem)]` → height-locked panes with nested scroll on desktop; stacked panes with `h-full` inside auto-height parent on mobile (nested scrollbars, unreliable heights) | `EncounterWorkspaceLayout.tsx:41,109,119,125` |
| M4 | No mobile nav on encounter page (bypasses shell) — on phones the only exit is the "Queue" button; no safe-area padding | `EncounterWorkspaceLayout.tsx:41-45` |
| M5 | Alerts panel defaults to expanded → pushes SOAP below the fold on phones | `EncounterWorkspaceLayout.tsx:25,111` |
| M6 | Queue sidebar (`xl:w-80 sticky top-20`) renders below the queue on mobile; sticky has no effect in flow | `doctor/queue/page.tsx:117-118` |
| M7 | Good practice noted: `DoctorQueueTable` has a dedicated mobile card list (`hidden sm:block` table) — keep this pattern | `DoctorQueueTable.tsx:216-297` |

## E. Reception → patient ↔ nurse ↔ doctor flow status
- ✅ Reception token → doctor queue (same `hms_appointment_store`)
- ✅ Reception IPD admission → doctor rounds; nurse vitals → doctor rounds (shared `useIpdStore`)
- ✅ Doctor lab orders → lab module (`hms_lab_orders`); lab results → doctor inbox (read-side)
- ✅ Signed encounter → patient EMR timeline (`hms_encounter_signed`, `emr_service`)
- ❌ SOAP + diagnoses + actual prescriptions → signed encounter (D9/D10/D14)
- ❌ Doctor prescriptions → pharmacy dispensing (D18)
- ❌ Reception triage vitals → doctor queue/encounter (D12/D13)
- ⚠️ PACS duplicate dispatch (D16); follow-up → reception booking (D15/D17); lab sign-off (D20); status naming `PENDING_LAB_PROCESSING` vs inbox union (D21)

## F. Recommended fix order (not executed — report only)
1. D8–D11, D18 (wrong-patient/meds safety + pharmacy flow)
2. D19, D2/D3, D12/D13 (identity & scoping)
3. D15–D17, D20–D21 (side-effect correctness)
4. M1–M4 + D1/D6 (routes, shell, responsiveness)
5. D22–D30 cleanups

---

