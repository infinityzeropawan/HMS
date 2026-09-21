here is the full report content plus the plan to save it (report only, no fixes).

Plan
On Act mode, create web/src/app/(nurse)/NURSE_SECTION_AUDIT_REPORT.md with the audit below.
Also write the doctor report that was never saved last turn (web/src/app/(doctor)/DOCTOR_SECTION_AUDIT_REPORT.md) so both sections have their report.
Verify both files (wc -l, head/tail). No code changes.
Nurse Section Audit (content to be saved)
A. Route map & entry points
Route	File	Notes
/nurse	(nurse)/nurse/page.tsx	Dead + orphan — redirect("/station") at line 25 inside a client component; ~180 lines of JSX after it never render
/station	station/page.tsx (78 L)	Mega-console embedding 10 panels
/vitals	vitals/page.tsx	NurseVitalsEntryConsole
/worklist	worklist/page.tsx	NurseDoctorOrdersWorklist
/mar/[ipdId]	mar/[ipdId]/page.tsx	MAR checklist
/fluid-chart	fluid-chart/page.tsx	Fluid I/O
/handover	handover/page.tsx	(nurse) HandoverForm + HandoverHistory
/wards	(ipd)/wards/page.tsx	Nurse nav points outside the module
Nav (HmsMobileNav.tsx:77-85): /station, /vitals, /worklist, /mar/IPD-8801, /fluid-chart, /handover, /wards. Login redirect auth_redirect.ts:6 → NURSE: "/station". No duplicate flattened URLs exist app-wide (verified uniq -d empty).

B. Routing, orphan & wrong-route bugs
ID	Finding	Evidence
N1	Nurse dashboard is dead code + orphan route: redirect("/station") inside a "use client" component, followed by unreachable JSX with hardcoded KPIs ("8 Inpatients", "2 Doses Now", "5-Rights Verified") and fake quick-link cards; no nav entry reaches /nurse	nurse/page.tsx:25-206
N2	Nav MAR route has a non-existent admission: /mar/IPD-8801, while the store holds IPD-2026-0881/0895/0902 → the page silently falls back to admissions[0], so medications are charted for the wrong patient	HmsMobileNav.tsx:81; mar/[ipdId]/page.tsx:16-18
N3	Same hardcoded IPD-8801 reused in the dead dashboard links	nurse/page.tsx:51,141
N4	Nav "Ward Rounds" → /wards belongs to the IPD module (no nurse-owned ward page); nurse nav mixes module surfaces	HmsMobileNav.tsx:85
N5	Keyboard shortcuts are nurse-unaware: Ctrl+Alt+S → /doctor/queue, Ctrl+Alt+F → /dashboard (reception "Patient Search"); no nurse shortcut exists	HmsKeyboardShortcutsListener.tsx:17-29
N6	/mar/[ipdId] root uses max-w-4xl without mx-auto (left-aligned against the shell)	mar/[ipdId]/page.tsx:27
C. Duplicate / parallel surfaces (the "duplicate routes" ask)
ID	Finding	Evidence
D1	/station re-embeds the dedicated pages' components: NurseDoctorOrdersWorklist (=/worklist), VitalsFlowsheetTable (=vitals), NurseFluidSurveillancePanel (=/fluid-chart), NurseHandoverCenterPanel (=/handover), NurseBedMatrixGrid (also on /nurse)	station/page.tsx:6-74
D2	Three vitals surfaces with three different rules: /vitals console (store write), VitalsFlowsheetTable (read-only, hardcoded GCS 15), NurseVitalsSurveillancePanel (different thresholds)	NurseVitalsEntryConsole.tsx, VitalsFlowsheetTable.tsx, NurseVitalsSurveillancePanel.tsx:15-18
D3	Two fluid surfaces with disagreeing numbers: /fluid-chart entries state vs /station's hardcoded logs	NurseFluidBalanceChart.tsx:28-62 vs NurseFluidSurveillancePanel.tsx:13-47
D4	Two handover surfaces: /handover (localStorage hms_nurse_handovers + mocks) vs /station's hardcoded summaries	HandoverForm.tsx:55-57 vs NurseHandoverCenterPanel.tsx:14-39
D5	Two medication surfaces: MAR checklist (hardcoded doses) vs Medication Command Center (hardcoded schedules, different drugs for the same patients)	MedicationAdminChecklist.tsx:25-30 vs NurseMedicationCommandCenter.tsx:25-70
D6	Three homes for vitals data: useNurseVitalsStore (hms_nurse_vitals_store) + useIpdStore.vitals (synced) + reception triage vitals in hms_patients (never read by nurse)	nurse_vitals_store.ts:119; NurseVitalsEntryConsole.tsx:55-60
D. Data-flow & patient-safety bugs
ID	Finding	Evidence
N9	Medication Command Center shows fabricated orders on real patients: hardcoded list incl. "Inj Fentanyl 50mcg IV (Controlled H1)" and "Inj Heparin 5000 IU IV Bolus STAT" attached to the real first three admissions; all four KPI counts derive from it; no link to MAR/pharmacy/doctor prescriptions	NurseMedicationCommandCenter.tsx:25-75,163
N10	MAR is hardcoded per admission (2 doses pre-marked "GIVEN" by "Duty Nurse"), not derived from doctor prescriptions or pharmacy; not persisted (reload restores the fake baseline); "Scan & Administer" performs no barcode scan while the toast claims "Barcode verified"; the only persistence is a free-text addRoundNote	MedicationAdminChecklist.tsx:25-30,37-78
N11	addRoundNote is abused as a generic logger in 4 nurse flows — it also sets roundStatus: "COMPLETED", lastRoundNote, lastRoundTime (and can flip admission status): nurse MAR/order/fluid/handover actions therefore mark the doctor's ward round as completed and overwrite the doctor's round note	ipd_store.ts:154-192; callers MedicationAdminChecklist.tsx:50, NurseDoctorOrdersWorklist.tsx:125, NurseFluidBalanceChart.tsx:105, HandoverForm.tsx:64
N12	Handover is written to the wrong patient: HandoverForm attaches the ward handover note to admissions[0] (first record in the store) regardless of ward/patients; defaults fabricate clinical facts ("Vitals stable across assigned beds", "Scheduled IV medications verified against MAR"); the 4-digit PIN is stored as the signature in plaintext in hms_nurse_handovers with only a required rule	HandoverForm.tsx:39-101,178-180
N13	Handover logbook is seeded with fabricated NABH records (fake nurses "Nurse Sunita Rao (Reg #NUR-4029)", ventilator details) and they persist whenever localStorage is empty	HandoverHistory.tsx:8-31,36-50
N14	Doctor orders never reach the nurse worklist: orders are hardcoded local state, include ghost doctor IDs DOC-105/DOC-108 (absent from the staff master), never persist (COMPLETED/ESCALATED revert on reload), and escalation notifications use hardcoded tenantId: "TNT-9014", hospitalId: "HOSP-01"	NurseDoctorOrdersWorklist.tsx:40-88,62,77,179-190
N15	Worklist completion claims "EMR Signed" but only writes a round note; no link to lab orders, pharmacy, or the doctor's encounter	NurseDoctorOrdersWorklist.tsx:105-152,315-320
N16	Clinical alerts panel invents allergies and vitals: every fall-risk row claims "Penicillin Allergy Watch"; fall-risk rule age > 60 || diagnosis.includes("op") (2-char substring matches almost any diagnosis) mislabels patients; a missing SpO2 renders as a fabricated critical 91% (p.vitals?.spO2 || 91); the "Active Ward Alerts" count mixes patients and notifications	NurseClinicalAlertsPanel.tsx:17-27,36,58,85
N17	Census KPIs partly fabricated/mislabeled: pendingOrdersCount = 2 hardcoded; "Due Medications" computed from the doctor's roundStatus === "DUE"; "Occupied Beds" silently falls back to ward census when the bed master is empty (|| wardCensus), masking desync; whole-hospital scope, no ward/duty-station filter	NurseStationLiveCensus.tsx:13-19
N18	Vitals entry fabricates values for missing input (Number(x) || 120/80/72/98/98.6, respiration 16, pain 2); hardcoded fallback identity (ipdId "IPD-2026-0881", uhid "P-2026-9912") means the free-text UHID/IPD fields can log vitals against the wrong patient; recordedAt is a locale string (unsortable, inconsistent with ISO everywhere else)	NurseVitalsEntryConsole.tsx:33-49,220-227
N19	Abnormal-vitals logic is weak and inconsistent across the three views: store ignores hypotension/bradycardia/tachypnoea/hypothermia and builds a warning string missing a space ("Fever (101.2°F)High BP"); the panel uses BP ≤ 90 + SpO2 < 94; the flowsheet flags only systolic ≥ 140 and SpO2 < 94	nurse_vitals_store.ts:92-101; NurseVitalsSurveillancePanel.tsx:15-18; VitalsFlowsheetTable.tsx:52,66
N20	Flowsheet fabricates neurology: gcs: 15 hardcoded for every row; the time column is derived by splitting a locale string (date lost → different days look identical)	VitalsFlowsheetTable.tsx:29,34
N21	Fluid chart: fake seeded entries; local-only state (lost on reload); the displayed net balance sums every patient and every shift yet reads as a patient balance; persistence matches the admission by patientName/bedNumber (collisions can attach the log to the wrong admission)	NurseFluidBalanceChart.tsx:28-62,67-69,102-112
N22	Fluid surveillance panel: hardcoded logs (numbers disagree with /fluid-chart) with "Patients" counts derived from rows	NurseFluidSurveillancePanel.tsx:13-51
N23	Handover center panel: hardcoded handovers with borrowed real identities, disconnected from the real hms_nurse_handovers register	NurseHandoverCenterPanel.tsx:14-42
N24	Patient360DrawerModal defaults uhid = "P-2026-9912" (another patient) and unknowingly shows the "Sunil Verma" fallback profile for unknown UHIDs; used by 7 nurse panels	Patient360DrawerModal.tsx:20,30; patient_profile_service.ts:20-44
N25	Schemas are unused and drifted: NurseVitalsSchema (patientIpdId, systolicBp, temperatureF, gcsScore) doesn't match the store/UI field names; MarCheckItemSchema has no corresponding MAR store	nurse_vitals_schema.ts (no importers)
N26	Staff identity inconsistency: the staff master holds 1 nurse ("Sr. Kavita R.") while the nurse login is "Priya Nair" and panels hardcode "Nurse Sunita Deshmukh"/"Nurse Kavita Roy" (plus fake registrations)	admin_user_store.ts:63-75; HandoverHistory.tsx:11-12; NurseHandoverCenterPanel.tsx:19-20
N27	No i18n anywhere in the nurse section (useI18n unused) — the language switcher has no effect	nurse section wide
N28	Reception triage vitals never reach the nurse station/MAR, and nurse→reception feedback (e.g., discharge ready) doesn't exist	(reception)/_reception_stores/reception_visit_store.ts (no consumer in (nurse))
E. Mobile responsiveness
ID	Finding	Evidence
M1	Orders worklist: 6-column Table, no overflow-x-auto and no mobile card view → overflow on phoCommand Center table: no wrapper/mobile nes	NurseDoctorOrdersWorklist.tsx:356
M2	Medication view	NurseMedicationCommandCenter.tsx:163
M3	Vitals entry console table (8 cols): no wrapper/mobile view	NurseVitalsEntryConsole.tsx:187
M4	Fluid I/O chart table: no wrapper/mobile view	NurseFluidBalanceChart.tsx:246
M5	Vitals modal is width={560} with grid-cols-3/grid-cols-2 (no responsive prefixes) → inputs cramped/overflow at ≤360 px	NurseVitalsEntryConsole.tsx:201,239
M6	Patient360 drawer is width={640} fixed → wider than a phone viewport (opened from bed matrix, alerts, fluid, handover, vitals, command center)	Patient360DrawerModal.tsx:56
M7	Bed sanitation row lays N "Mark … Sanitized" buttons in one non-wrapping flex row → overflow when several beds need cleaning	NurseBedOperationsPanel.tsx:63-80
M8	Good patterns to replicate: mobile card views in VitalsFlowsheetTable (:79), MedicationAdminChecklist (:118), HandoverHistory (:114), responsive bed grid (NurseBedMatrixGrid:27)	—
M9	Dense clinical text uses text-3xs (~9-10 px) and 14 px icon tap targets extensively → below the 12 px legibility floor and 44 px tap-target guidance on phones	nurse section wide
F. Reception → patient ↔ doctor ↔ nurse flow status
✅ Reception admission → nurse station census / MAR / bed matrix (shared useIpdStore; reception now creates admissions)
✅ Nurse vitals → IPD store → doctor rounds (updateVitals)
✅ Nurse bed sanitation → central BedService; audit events on MAR/order/fluid/handover
⚠️ Nurse MAR / orders / fluid / handover → IPD store through addRoundNote → corrupts the doctor's round status and note (N11/N12)
❌ Doctor orders → nurse worklist (no shared model; hardcoded fake orders with ghost doctor IDs) — the largest gap
❌ Doctor prescriptions → MAR (MAR is hardcoded, not derived from prescriptions or the pharmacy queue)
❌ Reception triage vitals → nurse station/MAR
❌ Handover register consistency (/station panel vs /handover console)
⚠️ Lab orders → worklist (no linkage; the worklist's LAB_SPECIMEN task is fake)
G. Recommended fix priority (report only — no fixes made)
Patient safety: N2, N9, N10, N11, N12, N13, N16, N20, N24
Flow connectivity: shared nurse task + MAR stores derived from hms_clinical_encounters_store and the pharmacy queue (N14, N15, N21, N22, N23)
Routing/duplicates: N1, N4, N5, D1–D6
Mobile: M1–M7, M9
Cleanup: N6, N17, N18, N19, N25–N28