The pharmacy deep-dive is complete. As with the earlier sections, I'm in **Plan mode**, so below is the full report plus the plan to save it (report only — no fixes).

# Pharmacy Section Audit

## A. Route map, duplicate URLs & broken links

**Actual routes** (flattened): `/pharmacy` (hub), `/dispense`, `/inventory`, `/controlled-drugs`, `/grn`, `/purchase-orders`, `/vendors`, `/reports`, `/pharmacy/transfers`.

| ID | Finding | Evidence |
|---|---|---|
| **PH-1** | **7 broken links on the pharmacy hub**: the dashboard's own action cards link to `/pharmacy/dispense`, `/pharmacy/inventory`, `/pharmacy/grn`, `/pharmacy/purchase-orders`, `/pharmacy/vendors`, `/pharmacy/controlled-drugs`, `/pharmacy/reports` — **none of these routes exist** (the real pages are at root level: `/dispense`, `/inventory`, `/grn`, …). Every quick-nav card on the hub 404s | `pharmacy/page.tsx:41,46,96-96,155-217` (href list verified: 12 hrefs, 7 of them `/pharmacy/*` non-existent) |
| **PH-2** | **Inconsistent IA / dual URL scheme**: 6 pages live at group root (`/dispense`…), 1 page (`pharmacy/transfers`) is nested under `/pharmacy/`. The sidebar nav (PHARMACY/PHARMACIST → `/dispense`, `/controlled-drugs`, `/inventory`) uses root paths; the hub uses the dead `/pharmacy/*` paths | `HmsMobileNav.tsx:147-155`; file tree |
| **PH-3** | **5 pages render without `HmsAppShell`** (`grn`, `purchase-orders`, `vendors`, `pharmacy/transfers`, `reports`) → no sidebar/nav/logout, and they **bypass the auth guard** (reachable signed-out) | grep: no `HmsAppShell` import in those 5 files |
| **PH-4** | Hub duplicates the dispense queue: `PharmacyDispenseTable` rendered on both `/pharmacy` and `/dispense`, each with **independent local state** hydrated from the same `hms_pharmacy_dispense` key → dispensing on one page doesn't reflect on the other; double-dispense of the same Rx is possible (status guard is per-component) | `pharmacy/page.tsx:237`; `dispense/page.tsx:46`; `PharmacyDispenseTable.tsx:108,124-143` |
| **PH-5** | `/pharmacy/transfers` name-collides conceptually with `/transfers` (Network → inter-hospital branch transfers) — confusing IA for staff | route list |
| **PH-6** | No i18n anywhere in the pharmacy section (`useI18n` unused) | grep |

## B. Doctor → pharmacy prescription flow (the core break)

| ID | Finding | Evidence |
|---|---|---|
| **PH-7** | **Real e-prescriptions never reach the counter**: the doctor writes `hms_pharmacy_queue` (encounter sign-off + Rx pane), but the dispense queue reads/writes `hms_pharmacy_dispense` and is seeded with `INITIAL_PRESCRIPTIONS` — **4 hardcoded demo Rx** (Sunil Verma, Anjali Gupta, Ramesh Kumar, Meena Joshi) with hardcoded diagnoses/allergies/bills. `hms_pharmacy_queue` has **zero readers** app-wide | `PharmacyDispenseTable.tsx:36-105,126,141`; `encounter_service.ts:82-91`; `PrescriptionPane.tsx:219-228` |
| **PH-8** | **No Rx verification**: dispensing never looks up the prescribing encounter (`hms_clinical_encounters_store` / `hms_encounter_signed`); any `rxId` string can be dispensed; the duplicate-dispense guard is only the component's local status | `PharmacyDispenseTable.tsx:160-195` |
| **PH-9** | **Allergies are decorative**: `allergies: "Penicillin Mild Rash"` sits in the seeded Rx whose items include **Cap Amoxicillin 500mg** — the demo data itself demonstrates an allergy conflict the dispenser happily dispenses; no CDSS/allergy check at the counter | `PharmacyDispenseTable.tsx:56-68` |
| **PH-10** | **No substitution/generic engine**, no partial dispensing, no back-order fulfilment (the doctor pane even toasts "backorder created" — pharmacy never tracks it), no returns/refunds for medicines, no credit-note linkage (billing store's `refundPayment`/`issueCreditNote` unused by pharmacy) | `pharmacy_service.ts` (no such APIs) |

## C. Patient context — IPD vs OPD, bills, "currently taking" (the gaps you asked for)

| ID | Finding | Evidence |
|---|---|---|
| **PH-11** | **The dispense queue has no OPD/IPD concept at all**: `PrescriptionRecord` (interface) has `rxId/uhid/patientName/doctorName/department/diagnosis/allergies/status/items/totalAmount` — **no `ipdId`, no bed/ward, no visit type, no admission linkage**. The counter cannot tell an IPD inpatient (should post to the ward running bill / advance deposit) from an OPD cash patient | `PharmacyDispenseTable.tsx:21-34` |
| **PH-12** | **Every pharmacy bill is posted as fully PAID CASH**, even when the payment mode radio is INSURANCE_TPA; no pending/partial/credit handling; payment mode is collected but the amount is taken from the prescription record — no tender/amount entry | `pharmacy_service.ts:74-80`; `PharmacyDispenseTable.tsx:122` |
| **PH-13** | **IPD dispenses corrupt the doctor's chart**: the EMR timeline note is written via `useIpdStore.addRoundNote(...)` with fallback `admissions[0]` — an **OPD patient's dispensing lands on a random inpatient's chart**, and the note marks the doctor's ward round COMPLETED (same `addRoundNote` corruption as the nurse audit) | `pharmacy_service.ts:94-106`; `ipd_store.ts:154-192` |
| **PH-14** | **"Currently taking medication" doesn't exist**: no per-patient active-medication view, no MAR linkage (nurse MAR is separate + hardcoded), no discharge-medication (TDM) list, no refill/repeat tracking, no per-patient bill history surface (billing has it, pharmacy doesn't link to it) | `pharmacy_service.ts`; `PharmacyDispenseTable.tsx` |
| **PH-15** | **No patient-360 at the counter**: clicking a patient in the queue opens nothing (nurse modules have `Patient360DrawerModal`); allergies/current-meds/bills can't be reviewed before dispensing | `PharmacyDispenseTable.tsx:261-296` |

## D. Search — what exists vs what "integrated advance search" requires

**Today**: one text input filtering **5 hardcoded rows** on `rxId / patientName / uhid` (`PharmacyDispenseTable.tsx:197-204`), plus inventory search by name/generic/code (`PharmacyInventoryTable.tsx:38-43`). Nothing searches the patient registry.

**Missing capabilities** (each is a concrete gap, not an opinion):
* UHID / phone / name lookup against the **patient registry** (with "not found" state, like reception booking)
* Filters: **OPD vs IPD**, ward/bed, doctor, department, date range, status (pending/partial/dispensed/returned), insurance vs cash
* Patient-level views: *all prescriptions for UHID X*, *active medications*, *bill history*, *pending IPD indents*
* Drug-level views: *who is on drug Y* (prescription tracing), batch-wise dispensing history
* Receipt reprint / GST breakup / returns

## E. Inventory, FEFO, GRN, PO, transfers

| ID | Finding | Evidence |
|---|---|---|
| **PH-16** | **FEFO is cosmetic**: `deductStock` matches by **substring `includes`** on the drug name and deducts from the **first** matching row only — expiry date and batch are ignored; the FEFO modal (`FefoBatchModal`) is called with only a drug name and always renders **hardcoded `DEFAULT_BATCHES`** (B-2025-02/B-2024-09/B-2025-06) unrelated to real inventory; the selected batch is discarded and never recorded on the dispense | `pharmacy_store.ts:462-483`; `FefoBatchModal.tsx:23-40,104-106`; `PharmacyDispenseTable.tsx:275,389-393` |
| **PH-17** | **Expired/zero stock dispensable**: `deductStock` never checks `expiryDate`; status recomputation only produces LOW_STOCK/IN_STOCK (never EXPIRED/FEFO_ALERT at runtime); qty clamps to 0 silently (under-dispense with no error/backorder) | `pharmacy_store.ts:462-483` |
| **PH-18** | **GRN breaks traceability**: GRN writes a **random** `poNumber` instead of the selected PO (`:542`), single-item hardcode `DRG-INWARD` (`:554`), received stock is merged by `name.includes(drugName)` and **overwrites** the existing batchNumber/expiryDate (`:572-576`) → multi-batch per drug (the precondition for FEFO) is impossible; manufacturer saved as vendor name, category forced to TABLET | `pharmacy_store.ts:536-598` |
| **PH-19** | **PO workflow broken**: `createPurchaseOrder` hardcodes `vendorId: "vnd-101"` regardless of selection, single-item POs, `unitPrice` derived by division; PO receipt status never transitions to RECEIVED on GRN | `pharmacy_store.ts:507-534` |
| **PH-20** | **Transfers lose stock**: transfer deducts from central pharmacy by substring but the destination (OT/ICU/ER/ward satellite stores) has **no ledger** — departmental stock is untracked; `drugCode` hardcoded `"DRG-TRF"` | `pharmacy_store.ts:600-636` |
| **PH-21** | **Dual alias state** in the store (`grnRecords`/`stockTransfers` getters, `:427-433`) — two names for one state, not serialized by persist; `DrugStockItem` has both `batchNumber` and `batchNo?`, `name` and `drugName?`, `status` enum includes `EXPIRED`/`FEFO_ALERT` never set at runtime — schema drift everywhere | `pharmacy_store.ts:6-21,112-120` |

## F. Controlled drugs (Schedule H/H1/X vault)

| ID | Finding | Evidence |
|---|---|---|
| **PH-22** | **H1 dispensing bypasses the NDPS register**: the dispense flow never writes `hms_controlled_drugs`; the register is a standalone manual-entry table with its own localStorage — a narcotic dispensed from the queue leaves **no vault entry**, and vault entries never deduct inventory | `PharmacyService` (no CDR write); `ControlledDrugRegisterTable.tsx:181-218` |
| **PH-23** | Register seeded with **orphaned patients**: "Arjun Mehta `P-2026-1070`", "Sunita Patel `P-2026-1075`", "Deepak Singh `P-2026-1082`" exist in no store | `ControlledDrugRegisterTable.tsx:52-93` |
| **PH-24** | No statutory controls: prescriber Reg # / patient ID proof are free text (not validated against staff master/registry), no dual sign-off workflow, no daily closing-balance reconciliation, no run-to-run totals | `ControlledDrugRegisterTable.tsx` |
| **PH-25** | The dashboard claims "28 Narcotic Vials — Double Verified" — a hardcoded number with no backing data | `pharmacy/page.tsx:~100-110` |

## G. Billing integration

| ID | Finding | Evidence |
|---|---|---|
| **PH-26** | **GST math is wrong**: items carry `gstRate: 12`, but `cgstAmount = 6% × totalAmount` and `sgstAmount = 6% × totalAmount` while `totalAmount` is left **pre-tax** → subtotal + CGST + SGST ≠ total, and collected cash excludes tax | `pharmacy_service.ts:74-89` |
| **PH-27** | `paidAmount = totalAmount`, `status: "PAID"` unconditionally (PH-12), so nothing ever lands in dues/refunds for pharmacy; billing store's credit notes/refunds are never exercised by pharmacy | `pharmacy_service.ts:79-80` |
| **PH-28** | No link from the pharmacy UI to the billing views: the pharmacist can't see the patient's outstanding bill/deposit before dispensing (IPD charge-to-bill flow doesn't exist) | — |

## H. UI/UX + mobile responsiveness

| ID | Finding | Evidence |
|---|---|---|
| **PH-29** | **Tables with no overflow wrapper / no mobile card view** (7-10 columns each): `PharmacyInventoryTable.tsx:181`, `reports/page.tsx:110`, `grn/page.tsx:123`, `purchase-orders/page.tsx:123`, `vendors/page.tsx:142`, `transfers/page.tsx:112` → horizontal overflow on phones. (Good patterns exist in `PharmacyDispenseTable:328-386`, `FefoBatchModal:113-149`, `ControlledDrugRegister:295-341` — replicate those.) |
| **PH-30** | Add-stock modal **fabricates data** for empty fields: expiry `2028-12-31`, qty `100`, price `10`, batch `BT-2026-001` (`PharmacyInventoryTable.tsx:17-31`) — invented inventory without warning; no vendor link, rack location, or barcode field |
| **PH-31** | Dead/fragile code: `PharmacyDispenseTable` imports `PrinterOutlined` with no print flow for the receipt; `grnRecords`/`stockTransfers` getters (PH-21); demo seeder writes `hms_pharmacy_dispense`/`hms_controlled_drugs` but never `hms_pharmacy_master_store`, and demo-clear doesn't clear the pharmacy master store → stale inventory survives "Clear Database" |
| **PH-32** | Hardcoded KPIs on the hub: "3 Prescriptions", "1,420 Items", "4 SKUs Low", "28 Narcotic Vials" vs an actual store of ~10 SKUs | `pharmacy/page.tsx:61-110` |

## I. What the pharmacy should have (gap list = your "everything" checklist)

**Patient-aware counter**: registry search by UHID/phone/name (OPD + IPD), source badge (OPD cash vs IPD charge-to-ward with bed/ward/admission no), Patient-360 drawer (allergies, active meds, bills), allergy/interaction re-check at dispense, partial dispense + back-order tracking, returns with credit note, substitution/generic alternates with price compare, counseling notes, delivery/handover signature.
**Prescription integrity**: read the real `hms_pharmacy_queue`/encounter store, verify rxId authenticity, show prescriber + license, no dispense without a matching signed encounter line item, controlled-drug auto-entry into the H1 vault with dual sign-off.
**Inventory**: batch-level stock (multi-batch per drug), enforced FEFO deduction with override + reason, expiry quarantine/near-expiry alerts (runtime-computed), GRN↔PO linkage, vendor-linked POs with approval flow, department indents (OT/ICU/ER/ward) with destination ledgers, stock-take/reconciliation with adjustment reasons, ABC/VED classification, consumption analytics.
**Billing**: GST-correct invoice math, payment collection with mode + amount + reference, IPD posting to patient running bill/deposit, credit/TPA pending flows, per-patient bill view, receipt reprint.

## J. Priority order (report only — nothing fixed)

1. **PH-1** (7 dead hub links) + **PH-3** (shell-less pages bypass auth) — immediate routing/security
2. **PH-7, PH-8** (real prescriptions to the counter) — the core flow
3. **PH-11–PH-15** (OPD/IPD context, patient 360, EMR-note fallback)
4. **PH-16–PH-21** (FEFO/GRN/PO/transfer inventory integrity)
5. **PH-22–PH-25** (controlled drugs), **PH-26–PH-28** (billing math)
6. **PH-29–PH-32** (mobile/UX/KPIs), search build-out (section D)

---

**Next step:** toggle to **Act mode** and I'll save this as `web/src/app/(pharmacy)/PHARMACY_SECTION_AUDIT_REPORT.md` (report only, no fixes). I can also write the still-pending reports for the other sections at the same time (`DOCTOR_SECTION_AUDIT_REPORT.md`, `NURSE_SECTION_AUDIT_REPORT.md`, `PATIENT_JOURNEY_AUDIT_REPORT.md`) — tell me which ones you want.