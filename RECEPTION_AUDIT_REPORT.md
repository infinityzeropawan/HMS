# Reception / Front-Desk Audit Report — HMS

**Scope**: `web/src/app/(reception)/**` (reception = hospital entry point for a patient) and every module it feeds.
**Auditor**: Cline · **Date**: 2026-09-21 · **Commit at audit time**: `d7f1ca0` (branch `main`)
**Stack at audit time**: Next.js 15.5.25 (App Router, route groups) · React 19 · antd 5.29.3 · zustand 5 + `persist` · zod 3 · Tailwind 4

---

## 1. Module map & entry points

| Route (URL) | File | Purpose |
|---|---|---|
| `/dashboard` | `web/src/app/(reception)/dashboard/page.tsx` (543 L) | Reception console: KPI cards, OPD queue table, OPD calendar, doctor-availability tab, booking drawer, reschedule modal, cancel modal, token-slip modal |
| `/reception` | `(reception)/reception/page.tsx` (7 L) | Orphan alias that re-exports `<ReceptionDashboard />` |
| `/patients/register` | `(reception)/patients/register/page.tsx` | Wrapper for `PatientRegWizard` |
| `/checkin` | `(kiosk)/checkin/page.tsx` (linked from reception) | Public self-check-in kiosk |
| `/transfers` | `(network)/transfers/page.tsx` (linked from reception) | Inter-branch transfers |

Support files: `_reception_stores/appointment_store.ts`, `_reception_services/appointment_service.ts`, `_reception_schemas/patient_reg_schema.ts`, `_reception_types/appointment_types.ts`, `_reception_components/**`.

Wiring that is **correct**: demo login `reception / rec123` → role `RECEPTIONIST` → `getRoleHomePath()` → `/dashboard` (`(auth)/_auth_constants/auth_redirect.ts:6-7`); `HmsMobileNav` has `RECEPTION` + `RECEPTIONIST` nav entries that point at real routes; no App-Router path collisions.

**Architectural gap (the reason for this audit)**: the OPD-vs-IPD decision the reception desk exists to make **does not exist in the codebase**. Grep for `disposition|referral|admitToIpd|OPD_TO_IPD|converted` returns nothing in reception, doctor or IPD modules. Reception only mints OPD tokens; `/admissions` (`(ipd)/_ipd_components/Admissions/IpdAdmissionDesk.tsx`) is an isolated desk that re-types the patient (hard-coded UHID `P-2026-9912`, age `42`, gender `Male`, hard-coded doctor names at `:281-315`) and never reads the patient registry or the appointment store.

## 2. End-to-end trace

```
Login (reception/rec123) ─► /dashboard  (reception console)
   │
   ├─ NEW PATIENT ─► /patients/register ─► PatientRegWizard
   │      step0 Demographics ─► step1 Triage Vitals ─► step2 Insurance ─► onFinish
   │         ├─ zod parse ─► dup check (localStorage hms_patients) ─► UHID P-2026-{seq}
   │         ├─ write hms_patients ─► Modal.success "Book Immediate OPD Appointment"
   │         └─ onOk ─► AppointmentBookingDrawer        X  books for P-2026-1049 (B1)
   │
   ├─ EXISTING PATIENT ─► Book OPD Appointment (drawer)
   │   AppointmentService.checkDoctorAvailability()
   │      ├─ rosterStore.isSlotBlocked(day, doctorId)            hms_roster_master_store
   │      ├─ roster OFF_DUTY lookup .......................... X  DEAD CODE (B3)
   │      └─ staffUserStore SUSPENDED/TERMINATED lookup ...... X  never matches DOC-104 (B6)
   │   useAppointmentStore.addAppointment() ─► token T-xx ..... X  no slot capacity check (B5)
   │   NotificationService.sendNotification(sms) ............. X  unregistered template key
   │
   ├─► Queue table (List / Calendar / Doctors)
   │      X not date-scoped (B14) · Call In → IN_CONSULTATION · Slip "print" = toast (B18)
   │
   └─► Doctor module reads the SAME store: DoctorQueueTable → encounter → billing/lab/pharmacy
       (EmrService, patient_profile_service, encounter_service also read it by UHID)

Self check-in (/checkin) ─► KioskTokenScanner ─► RANDOM token, store NOT touched  X dead end (B12)
IPD (/admissions) ─► IpdAdmissionDesk ─► manual re-typed form                     X no link (B19)
```

## 3. Bugs — severity ordered

### 3.1 Critical — patient safety / security / wrong attribution

**B1 — Booking drawer defaults to another patient.**
`AppointmentBookingDrawer.tsx:129-134` sets `initialValues.patientUhid = "P-2026-1049"` (Sunil Verma) and the form is never reset on cancel (reset happens only after a successful booking, `:105`). The "Register New Patient → Book Immediate OPD Appointment" flow (`PatientRegWizard.tsx:82-86`) therefore mints the queue token **for the wrong patient**, and a receptionist can press "Issue Queue Token" without selecting any patient.
*Fix*: no default patient; require explicit selection; accept the just-registered UHID as a prop; `form.resetFields()` on close; disable submit until a patient is chosen.

**B2 — Reception routes are unauthenticated and the shell impersonates a doctor.**
`middleware.ts:16-21` reads cookie `hms_user_auth_session`, but that key is only ever written to **localStorage** by the zustand persist config (`auth_user_store.ts:77`) — no cookie is ever set, so the check is dead code and the middleware always calls `NextResponse.next()`. `HmsAppShell.tsx` has no guard and defaults `userRole = user?.role || "DOCTOR"` (`:32`).
*Fix*: set/clear a real session cookie on login/logout, make `middleware.ts` redirect unauthenticated non-public paths to `/login`, and make `HmsAppShell` redirect when there is no session instead of defaulting to `DOCTOR`.

**B3 — "Doctor on leave" guard is dead code (doctors on leave stay bookable).**
`appointment_service.ts:42-47` compares `doctorId` (`"DOC-101"`) with roster `staffId` (`"STF-101"`), `userId` (`"USR-101"`) and `r.staffName.toLowerCase().includes("doc-101")` — false in every case against `admin_roster_store.ts:26-45`. The name predicate is also logically inverted, and `StaffShiftRoster.dutyDate` (`roster_types.ts:32`) is ignored (`:49-57`), so today's duty status would be applied to any date.
*Fix*: resolve the doctor from the staff master (`useStaffUserStore`, canonical `staffId`), then join the roster by `userId`/`staffId`, then by normalised `staffName === staffUser.fullName`; only apply `OFF_DUTY`/`ON_LEAVE` when `dutyDate === requestedDate`.

**B4 — One doctor's blocked weekday blocks every doctor, for the wrong doctor.**
`admin_roster_store.ts:176-188` (`toggleSlotBlock`) writes both the per-doctor key `` `${doctorId}-${day}` `` **and** the generic `day` key; `isSlotBlocked` (`:190-195`) ORs them. `DoctorScheduleView.tsx:37-38,83` hard-codes `"DOC-101"` for whoever is logged in.
*Fix*: store blocks strictly per doctor (`${staffId}-${day}`), migrate/ignore the legacy generic key, and pass the logged-in doctor's `userId` from the auth store.

**B5 — No slot-capacity validation → double booking.**
`appointment_store.ts:98-114` (`addAppointment`) and `:124-142` (`rescheduleAppointment`) never check whether `(doctorId, date, slot)` is already taken; the drawer renders every slot as "Available" (`AppointmentBookingDrawer.tsx:191-198`); rescheduling into the patient's *existing* slot is allowed.
*Fix*: add `isSlotTaken()` to the store, a slot template + taken-slot service for the UI (disable taken slots), and reject conflicting bookings in the service layer.

### 3.2 High — data integrity / broken trace

**B6 — Doctor master duplicated three times and contradicting the staff master.**
Drawer `DOCTORS` (`AppointmentBookingDrawer.tsx:30-35`) and dashboard `doctorList` (`dashboard/page.tsx:223-228`) disagree with `admin_user_store.ts` (DOC-102 = Dr. Ananya Roy, DOC-103 = Dr. Vikram Sethi) and `admin_roster_store.ts` (STF/USR ids). DOC-104 exists only inside the reception drawer, so its suspension/roster checks can never resolve.
*Fix*: single `ReceptionDoctorService` sourced from `useStaffUserStore` (`roleCategory === "DOCTOR"`) + roster for room/shift; delete both hard-coded arrays.

**B7 — Department identifiers are not canonical.**
`AppointmentBookingDrawer.tsx:93-94` passes `departmentId: selectedDoc.dept, departmentCode: selectedDoc.dept` → literal `"CARDIOLOGY"` in fields that must hold `"dept-101"` / `"CARD-01"` (store defaults at `appointment_store.ts:25-27` do it correctly).
*Fix*: take `departmentId`/`departmentCode`/`departmentName` from the staff master.

**B8 — UHID allocation can collide with existing/demo patients.**
`PatientRegWizard.tsx:48-55` starts at `1060` with no uniqueness check; demo patients occupy `P-2026-1049…1065` and the demo counter is `1065` (`hms_demo_seeder.ts:239`). On a fresh browser the 3rd registration can mint `P-2026-1062`, which `EmrService.getPatientDemographics` (`emr_service.ts:41-58`) resolves to a demo patient.
*Fix*: `PatientRegistryService.allocateUhid()` that scans `hms_patients` + `DEMO_PATIENTS` and only returns an unused id.

**B9 — Duplicate registration warns but still saves; Aadhaar placeholder is fake.**
`PatientRegWizard.tsx:36-46` warns then continues at `:63-67`; `initialValues.aadhaarNumber = "XXXX-XXXX-1234"` (`:109`) is pre-filled for every patient.
*Fix*: hard-block on duplicate phone/Aadhaar (offer the existing UHID), remove the Aadhaar prefill (placeholder only).

**B10 — Age never captured; tokens show "30y" and a raw gender enum.**
The schema stores `dob` only (`patient_reg_schema.ts`) while `AppointmentBookingDrawer.tsx:64` reads `p.age` → `"MALE (30y)"`.
*Fix*: `PatientRegistryService.toAgeGender()` deriving age from `dob`, producing `"45 / Male"`.

**B11 — Triage vitals captured at reception are write-only; no triage priority.**
Vitals land only in the `hms_patients` blob; nurse vitals use `useIpdStore.updateVitals` and the doctor queue hard-codes vitals (`DoctorQueueTable.tsx:62`).
*Fix*: persist a `ReceptionVisit` (vitals + triage priority + disposition) in a reception visit store, surface abnormal values at the desk, and expose the visit to the doctor queue.

**B12 — Self check-in is a dead end.**
`KioskTokenScanner.tsx:11-15` mints a random `T-${10..99}` token, never touching the appointment store, without verifying UHID/mobile.
*Fix*: look the patient up in the registry by UHID/mobile, reuse today's appointment (or issue a real token through `AppointmentService`), and show the real doctor/room.

**B13 — Seeder and reception store are disconnected.**
`hms_demo_seeder.ts:233-241,293` writes/reads `hms_appointments` + `hms_last_token_num` which nothing consumes; the store persists under `hms_appointment_store` (`appointment_store.ts:167`) and `resetToDefaults()` has no callers.
*Fix*: seed/clear the real store keys (`hms_appointment_store`, `hms_reception_visits_store`) and update the stats list.

**B14 — Queue and KPIs are not date-scoped.**
`dashboard/page.tsx:81-88` filters only by search text; KPIs at `:302,313,325` and per-doctor counts at `:385` include every appointment ever booked while the labels claim "Today".
*Fix*: date-scoped queue views (Today / Upcoming / All), truthful KPI labels, guard "Call In" to today's waiting patients.

**B19 — No OPD-vs-IPD decision and no hand-off to IPD.**
No disposition field/UI exists; `IpdAdmissionDesk.tsx:276-317` re-types the patient with hard-coded UHID `P-2026-9912`, age `42`, gender `Male` and a hard-coded doctor list.
*Fix*: record a triage disposition (`OPD` / `IPD_ADVICE` / `EMERGENCY` / `REFERRAL`) on the reception visit, add an "Admit to IPD" action on the queue row that prefills patient + doctor and creates the admission through `useIpdStore.addAdmission` + `BedService.allocateBed` (+ advance deposit), and guard against duplicate admission of an already-admitted UHID.

### 3.3 Medium

| ID | Bug | Evidence | Fix |
|---|---|---|---|
| **B15** | Reschedule modal keeps stale state (previous appointment's date/slot) | `RescheduleAppointmentModal.tsx:34-36`, mounted permanently at `dashboard/page.tsx:429-433`, `initialValues` never refresh `:76-79` | sync state with the `appointment` prop (`useEffect` on `appointment?.id`) + `key` on the form |
| **B16** | Token sequence is global, persisted forever, never reset per day | `appointment_store.ts:96,98-114` | per-day scoped sequence (`lastTokenSeqByDate`) |
| **B17** | No audit trail for booking/cancel/reschedule; duplicate cancel paths; unused store action | no `PlatformAuditService` in `(reception)`; `dashboard/page.tsx:47` eslint warning | route all mutations through `AppointmentService` which records audit events |
| **B18** | Token slip cannot print and is hard-coded to "HMS MEDICAL CENTER" | `dashboard/page.tsx:485-494`, `:500` | `window.print()` with a print-scoped slip + hospital name from the auth store |
| **B20** | Unused `dayjs` import which is **not a declared dependency** | `dashboard/page.tsx:33`; `web/package.json` | remove the import |
| **B21** | `/reception` orphan alias; plan-doc routes and token-display/queue screens missing | `(reception)/reception/page.tsx`; `frontend_ui_ux_implementation_plan.md:536-635` | keep `/reception` as a documented alias; queue/token-display screens are a follow-up |
| **B22** | antd deprecation: `Calendar dateCellRender` → `cellRender` | `dashboard/page.tsx:375`; `antd/es/calendar/generateCalendar.d.ts:26` | migrate to `cellRender` |

### 3.4 Verification performed during the audit

* `npx tsc --noEmit` → **0 errors** (none of these bugs are caught by the type checker)
* `npx eslint 'src/app/(reception)'` → **2 warnings**: unused `dayjs` (`dashboard/page.tsx:33`), unused `cancelAppointment` (`:47`)
* Route-collision scan over all `page.tsx` files → none

## 4. Implementation plan

**Phase 1 — safety & data integrity (B1, B3, B4, B5, B6, B7, B8, B9, B10)**
1. `_reception_services/patient_registry_service.ts` (new) — single patient index over `hms_patients` + `DEMO_PATIENTS`: `getPatients`, `findByUhid`, `findByPhone`, `checkDuplicate`, `allocateUhid`, `registerPatient`, `computeAge`, `toAgeGender`, `toPatientOption`.
2. `_reception_services/reception_doctor_service.ts` (new) — doctor master from `useStaffUserStore` + `useRosterStore`: `getDoctors`, `getDoctor`, `checkDoctorAvailability` (canonical ids, duty-date aware leave, blocked slots, past-date guard), `getSlotsForDoctor(date)` with `taken` flags, `isSlotTaken`.
3. `admin_roster_store.ts` — per-doctor blocks only; legacy generic key read-only migration.
4. `DoctorScheduleView.tsx` — use the logged-in doctor's `userId` instead of `"DOC-101"`.
5. `appointment_store.ts` — `isSlotTaken`, conflict-checked `addAppointment`/`rescheduleAppointment`, per-day token sequence.
6. `appointment_service.ts` — availability via the new doctor service, slot conflict rejection, `PlatformAuditService` audit events for book/reschedule/cancel.
7. Registration UI — no fake Aadhaar prefill, hard duplicate block, real age, registry-backed UHID.

**Phase 2 — trace completeness (B12, B13, B14, B16, B17, B18, B20, B22)**
8. Dashboard queue scoped to Today / Upcoming / All with truthful KPIs and guarded "Call In"; `cellRender`; printable slip with the real hospital name; remove dead imports.
9. Kiosk self check-in wired to the registry + appointment store.
10. Demo seeder seeds/clears the real store keys and reports real counts.

**Phase 3 — the OPD vs IPD decision (B11, B19)**
11. `_reception_types/visit_types.ts` + `_reception_stores/reception_visit_store.ts` (new) — `ReceptionVisit` with vitals, triage priority and disposition.
12. Triage priority captured in the registration Vitals step with abnormal-value warnings.
13. `_reception_services/visit_disposition_service.ts` (new) — `recordDisposition` + `admitToIpd` (Ipd store + `BedService.allocateBed` + advance deposit + audit + admission SMS) with duplicate-admission guard.
14. `_reception_components/Disposition/PatientDispositionModal.tsx` (new) + "Disposition / Admit to IPD" action on every queue row.

**Phase 4 — hardening (follow-up)**
15. Real session cookie + enforcing middleware + `HmsAppShell` guard (B2).
16. Queue-display board, keyboard shortcuts/offline queue for the desk, and doc/route alignment with `frontend_ui_ux_implementation_plan.md` §6 (B21).

## 5. Implementation log

**Verification after implementation**
* `npx tsc --noEmit` → **exit 0** (0 errors)
* `npx eslint 'src/app/(reception)' 'src/app/(kiosk)' 'src/middleware.ts' 'src/common_components/HmsAppShell' 'src/lib/demo_seeder' 'src/app/(doctor)/_doctor_components/Schedule' 'src/app/(auth)/_auth_stores' 'src/app/(ipd)/_ipd_stores'` → **exit 0, 0 errors, 0 warnings**
* `npx next build` → **exit 0** (compiles, type-checks and prerenders every route incl. `/dashboard`, `/reception`, `/patients/register`, `/checkin`)

**New files**

| File | Purpose |
|---|---|
| `_reception_utils/date_utils.ts` | Local-timezone date helpers (`todayLocalDate`, `tomorrowLocalDate`, `isPastDate`, `dayNameOf`, `isPastSlot`, `formatDisplayDate`) — removes the `toISOString()` UTC "yesterday before 05:30 IST" bug |
| `_reception_types/visit_types.ts` | `TriagePriority`, `CareDisposition`, `ReceptionVitals`, `ReceptionVisit` + label/colour maps |
| `_reception_stores/reception_visit_store.ts` | Persisted (`hms_reception_visits_store`) front-desk visit store: createVisit / updateTriage / recordDisposition / linkAdmission / linkAppointment |
| `_reception_services/patient_registry_service.ts` | Single patient index over `hms_patients` + `DEMO_PATIENTS`: find, duplicate check, collision-safe UHID allocation, age/ageGender, options |
| `_reception_services/reception_doctor_service.ts` | Doctor master from the staff store + roster join; availability (account status, per-doctor clinic block, duty-date leave, past date); slot template with taken/past flags; `isSlotTaken` |
| `_reception_services/visit_disposition_service.ts` | **OPD vs IPD decision engine**: `recordDisposition` + `admitToIpd` (duplicate-admission guard → bed validation/lock → IPD record → advance deposit → visit link → ward notification → audit) |
| `_reception_components/Disposition/PatientDispositionModal.tsx` | The decision UI on every queue row: triage summary, disposition, and (for IPD) bed/consultant/diagnosis/deposit/TPA capture |

**Bug-by-bug status**

| ID | Fix implemented |
|---|---|
| **B1** | `AppointmentBookingDrawer` has **no default patient** (`initialValues.patientUhid` removed), accepts `initialPatientUhid` + `visitId` props, resets the form on close, shows the selected patient's age/gender/phone, and disables “Issue Queue Token” until a patient is chosen. |
| **B2** | Session **cookie** written on login / cleared on logout (`auth_user_store`); `middleware.ts` redirects unauthenticated non-public requests to `/login` (`/login` + `/checkin` stay public); `HmsAppShell` guards on hydration instead of defaulting `userRole` to `DOCTOR`. |
| **B3** | `ReceptionDoctorService.checkDoctorAvailability` resolves the doctor from the staff master and joins the roster on `staffId` → `userId` → normalised `staffName`; `OFF_DUTY`/`ON_LEAVE` applies only to the matching `dutyDate`; past dates/slots rejected. |
| **B4** | `toggleSlotBlock` writes only `${staffId}-${day}` and deletes the legacy doctor-agnostic key; `isSlotBlocked` honours the legacy key for DOC-101 only; `DoctorScheduleView` uses the signed-in doctor's `userId`. |
| **B5** | `bookAppointment`/`reschedule` reject taken slots, the store itself refuses a conflicting `(doctor, date, slot)`, and the drawer/reschedule slot lists disable taken (“Booked · T-xx”) and elapsed slots. |
| **B6** | Both hard-coded doctor lists deleted — the drawer and the “Doctor Availability” tab read `ReceptionDoctorService.getDoctors()`; default queue rows re-pointed to the master's `DOC-101/102/103`. |
| **B7** | Booking passes the staff master's `departmentId`/`departmentCode`/`departmentName`; default rows use `dept-101/CARD-01`, `dept-102/NEURO-02`, `dept-103/ICU-CCU`. |
| **B8** | `PatientRegistryService.allocateUhid()` scans every known UHID (incl. demo patients) and only issues an unused id. |
| **B9** | Duplicate registration is **blocked** with a modal offering the existing UHID → straight into booking; fake Aadhaar prefill removed; the legacy `XXXX-XXXX-1234` placeholder is excluded from duplicate matching. |
| **B10** | Age derived from `dob` (`computeAge`) and rendered `45 / Male` (`toAgeGender`) across booking drawer, default rows, token slip, IPD admission and kiosk. |
| **B11** | Triage vitals + priority persisted in a `ReceptionVisit`; abnormal/critical vitals raise an alert with escalation guidance; the console shows the triage tag and the disposition modal replays the vitals. |
| **B12** | Kiosk verifies the patient in the registry (UHID/mobile), checks in against today's live appointment (`markCheckedIn`) and shows the real token/doctor/room; unknown patient or missing appointment yields an actionable message instead of a phantom random token. |
| **B13** | Seeder resets + persists the real store keys (`hms_appointment_store`, `hms_reception_visits_store`), seeds `DEMO_RECEPTION_VISITS`, drops the orphan `hms_appointments`/`hms_last_token_num` keys; `getStorageStats` understands zustand-persist payloads; `clearAllDemoData` clears those keys and resets the in-memory stores. |
| **B14** | Queue scoped Today / Upcoming / All (Segmented) with `formatDisplayDate`; KPIs today-scoped and relabelled; “Call In” only for today's waiting tokens; per-doctor counts today-scoped. |
| **B15** | Reschedule modal re-syncs `date`/`slot` from the `appointment` prop on every open, clears the error state and surfaces service failures inline. |
| **B16** | Token sequence is per consultation date (`lastTokenSeqByDate`) and self-heals from the existing tokens of that date. |
| **B17** | All mutations go through `AppointmentService` (book/reschedule/cancel/call-in), each writing a `PlatformAuditService` event; the unused store `cancelAppointment` destructure is gone. |
| **B18** | Slip shows the real tenant name from the auth store; “Print Token Slip” calls `window.print()` on the print-scoped section. |
| **B19** | **OPD vs IPD is now decided at reception**: “Disposition” on every queue row records `OPD` / `IPD_ADMITTED` / `EMERGENCY` / `REFERRED` on the reception visit; IPD admits via the bed engine + IPD store + advance deposit + ward notification with a duplicate-admission guard, and closes the OPD token as COMPLETED. |
| **B20** | Unused `dayjs` value import removed (only the `Dayjs` type remains); `dayjs` added to `package.json` dependencies. |
| **B22** | `Calendar dateCellRender` → `cellRender` (`info.type === "date"`). |

**Remaining / recommended follow-ups (deliberately not changed here)**

1. `(ipd)/_ipd_components/Admissions/IpdAdmissionDesk.tsx` still has hard-coded admission defaults (`P-2026-9912`, age 42, gender Male) and a hard-coded consultant list; reception-created admissions are now the recommended route, but the IPD desk should consume the registry too.
2. `ipd_store` demo admission for “Sunil Verma” uses UHID `P-2026-9912` while the registry/appointments use `P-2026-1049` — demo data needs one canonical UHID per patient.
3. `DoctorQueueTable` still maps **every** appointment (any date/doctor) into a doctor's queue and hard-codes the vitals string; it should filter on `doctorId === session.userId` + `date === today` and read the visit vitals.
4. `/reception` remains a thin alias of `/dashboard`; the plan-doc routes (`/reception/dashboard`, `/reception/queue`, `/reception/token-display`) plus a queue-display board and offline desk support are still open (§6 of `frontend_ui_ux_implementation_plan.md`).
5. `destroyOnClose` (18 usages) is deprecated in antd 5.25+ in favour of `destroyOnHidden` — repo-wide cleanup.
6. The ABHA/ABDM linkage claimed in the registration success message is still cosmetic (no gateway call).
