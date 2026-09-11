# HMS Frontend - Priority Fixes & Missing Functionalities (Demo Data Only)

**Date**: September 11, 2026  
**Scope**: Fix all bugs and implement all missing features with mock/demo data  
**No Backend Integration**: All data remains client-side (localStorage or in-memory)

---

## PRIORITY 1: CRITICAL BUGS (Must Fix Today)

### 1. Queue Management "Call Next" Button (DOC-001)
**Impact**: Doctor cannot manage patient queue  
**File**: `web/src/app/(doctor)/_doctor_components/OpdQueue/DoctorQueueTable.tsx`  
**Fix**: Implement demo state machine for queue progression
- [x] Add state: WAITING → CALLED → CONSULTING → COMPLETED
- [x] "Call Next" updates state and moves patient to top
- [x] Add timestamp tracking for wait time calculation

### 2. Encounter Notes Auto-Save (DOC-002)  
**Impact**: Doctor's clinical notes lost on page reload  
**File**: `web/src/app/(doctor)/_doctor_components/EncounterWorkspace/Panes/SoapPane.tsx`  
**Fix**: Persist notes to localStorage with draft indicator
- [x] Auto-save to localStorage every 30 seconds
- [x] Show "Draft" badge when unsaved
- [x] Load saved notes on component mount

### 3. Pharmacy FEFO Logic (PHARM-002)  
**Impact**: Wrong batch selected, could dispense expired drugs  
**File**: `web/src/app/(pharmacy)/_pharmacy_components/FefoBatchSelector/FefoBatchModal.tsx`  
**Fix**: Implement FEFO batch sorting algorithm
- [x] Sort batches by expiry date (earliest first)
- [x] Highlight recommended FEFO batch
- [x] Show expiry date prominently

### 4. Lab Panic Alert SMS (LAB-003)  
**Impact**: Critical lab values not reaching doctor  
**File**: `web/src/app/(lab)/_lab_components/ResultEntry/LabResultForm.tsx`  
**Fix**: Show simulated SMS/WhatsApp alert
- [x] Display message: "SMS sent to Dr. Rajesh Sharma: PANIC ALERT..."
- [x] Copy alert text for manual SMS

### 5. Invoice Number Uniqueness (BILL-006)  
**Impact**: Invoice numbers could collide causing billing errors  
**File**: `web/src/app/(billing)/_billing_components/InvoiceGenerator/GstInvoiceForm.tsx`  
**Fix**: Use sequential invoice numbering from localStorage
- [x] Store last invoice number in localStorage
- [x] Increment by 1 for each new invoice
- [x] Format: INV-2026-00001, INV-2026-00002, etc.

---

## PRIORITY 2: MISSING CRITICAL WORKFLOWS (This Sprint)

### 6. Create Shift Handover Page ❌ MISSING  
**Impact**: Nursing operations impossible; US-NUR-02 not implemented  
**Files to Create**:
- `web/src/app/(nurse)/handover/page.tsx` (NEW)
- `web/src/app/(nurse)/_nurse_components/ShiftHandover/HandoverForm.tsx` (NEW)
- `web/src/app/(nurse)/_nurse_components/ShiftHandover/HandoverHistory.tsx` (NEW)

**Features**:
- [x] Structured template (incoming shift → outgoing shift)
- [x] Patient summary generation
- [x] Signature pad for digital signature (via `react-signature-canvas`)
- [x] Save to localStorage with timestamp
- [x] Print handover report

### 7. Controlled Drug Register Page ❌ MISSING  
**Impact**: Regulatory compliance gap (Schedule H/H1/X tracking)  
**Files to Create**:
- `web/src/app/(pharmacy)/controlled-drugs/page.tsx` (NEW)
- `web/src/app/(pharmacy)/_pharmacy_components/ControlledDrugRegister/RegisterTable.tsx` (NEW)

**Features**:
- [x] Append-only table (no delete/edit buttons)
- [x] Fields: Drug name, Batch #, Quantity dispensed, Patient, Date/Time
- [x] Monthly report generation
- [x] localStorage persistence

### 8. Appointment Booking with Doctor Availability  
**Impact**: Overbooking possible; no real slot management  
**File**: `web/src/app/(reception)/_reception_components/AppointmentBooking/AppointmentBookingDrawer.tsx`

**Fix with Demo Data**:
- [x] Load demo doctor schedules with available slots
- [x] Show 5 available time slots per doctor
- [x] Generate sequential queue token (T-001, T-002, T-003)
- [x] Save booking to localStorage

### 9. Patient Registration with UHID Generation  
**Impact**: UHID never persists; duplicate patients can register  
**File**: `web/src/app/(reception)/_reception_components/PatientRegistration/PatientRegWizard.tsx`

**Fix with Demo Data**:
- [x] Generate UHID format: P-2026-{4-digit sequence}
- [x] Store to localStorage with Aadhaar as key
- [x] Check for duplicates before saving
- [x] Show generated UHID in success message

---

## PRIORITY 3: DATA PERSISTENCE & VALIDATION (Next)

### 10. Vitals Logging Persistence  
**File**: `web/src/app/(nurse)/_nurse_components/StationDashboard/VitalsFlowsheetTable.tsx`  
**Fix**:
- [x] Save vitals to localStorage with patient UHID + timestamp
- [x] Load previous vitals when page opens
- [x] Add abnormal value warnings (BP >160 or <90, O2 < 90)

### 11. MAR Checklist Persistence  
**File**: `web/src/app/(nurse)/_nurse_components/MarChecklist/MedicationAdminChecklist.tsx`  
**Fix**:
- [x] Save medication administration timestamps to localStorage
- [x] Mark as "GIVEN" with time
- [x] Show "Given by: [Nurse name]" and timestamp

### 12. Lab Results Persistence  
**File**: `web/src/app/(lab)/_lab_components/ResultEntry/LabResultForm.tsx`  
**Fix**:
- [x] Save results to localStorage with order ID
- [x] Link to doctor who can view in patient EMR
- [x] Show "Result published" message

### 13. Invoice Persistence  
**File**: `web/src/app/(billing)/_billing_components/InvoiceGenerator/GstInvoiceForm.tsx`  
**Fix**:
- [x] Save invoice to localStorage with items breakdown
- [x] Add invoice search page: `web/src/app/(billing)/invoices/search/page.tsx`
- [x] Display saved invoices with "Reprint" option

---

## PRIORITY 4: REAL-TIME DEMO DATA UPDATES

### 14. Live Queue Display  
**File**: `web/src/app/(reception)/dashboard/page.tsx`  
**Fix**:
- [x] Use setInterval to simulate queue movement every 30 seconds
- [x] "Call Next" removes patient from queue, adds to current
- [x] Add "Patient Called" notification effect

### 15. Dashboard Statistics  
**Files**:
- `web/src/app/(reception)/dashboard/page.tsx`
- `web/src/app/(doctor)/queue/page.tsx`

**Fix**: Calculate from localStorage data
- [x] Total patients today = length of localStorage patients array
- [x] Completed = count where status === "COMPLETED"
- [x] Waiting = count where status === "WAITING"
- [x] Average time = calculate from timestamps

---

## PRIORITY 5: FORM VALIDATION FIXES

### 16. Aadhaar Format Validation  
**File**: `web/src/app/(reception)/_reception_components/PatientRegistration/Steps/DemographicsStep.tsx`  
**Fix**:
- [x] Accept only XXXX-XXXX-XXXX format
- [x] Show error: "Aadhaar must be in format: XXXX-XXXX-XXXX"
- [x] Auto-format: Remove spaces, add hyphens

### 17. Phone Number Validation  
**Fix**:
- [x] Accept only 10 digits (Indian format)
- [x] Show error for less than 10 digits

### 18. Lab Value Range Validation  
**File**: `web/src/app/(lab)/_lab_components/ResultEntry/LabResultForm.tsx`  
**Fix**:
- [x] Hemoglobin: 0-20 g/dL valid range
- [x] TLC: 1000-100000 /cu mm
- [x] Show error if out of range

---

## PRIORITY 6: NAVIGATION & WORKFLOW FIXES

### 19. Doctor Queue → Encounter Link  
**File**: `web/src/app/(doctor)/_doctor_components/OpdQueue/DoctorQueueTable.tsx`  
**Fix**:
- [x] Make patient name clickable
- [x] Navigate to `/encounter/[uhid]` when clicked
- [x] Pre-fill patient data

### 20. Patient Registration → Confirmation  
**File**: `web/src/app/(reception)/_reception_components/PatientRegistration/PatientRegWizard.tsx`  
**Fix**:
- [x] After registration, show confirmation with UHID
- [x] Add button: "Book Appointment" → redirects to appointment drawer
- [x] Add button: "Done" → resets form for next patient

### 21. Discharge → Receipt  
**File**: `web/src/app/(ipd)/_ipd_components/DischargeSummary/AbdmDischargeSummaryForm.tsx`  
**Fix**:
- [x] After discharge, show summary with discharge date/time
- [x] Add "Print Discharge Summary" button
- [x] Save to localStorage for future reference

---

## PRIORITY 7: NEW PAGES TO CREATE

### Page 1: Shift Handover  
**Location**: `web/src/app/(nurse)/handover/page.tsx`  
**Components Needed**:
- HandoverForm (incoming/outgoing shift info)
- PatientSummaryGrid (list of patients with brief status)
- SignaturePad (digital signature capture)
- HandoverHistory (past handovers)

**Mock Data**: Pre-populate with 8 patients from IPD

### Page 2: Controlled Drug Register  
**Location**: `web/src/app/(pharmacy)/controlled-drugs/page.tsx`  
**Components Needed**:
- DrugRegisterTable (append-only log)
- ReportGenerator (monthly PDF)

**Mock Data**: 20 entries of Schedule H drug dispensing

### Page 3: Invoice Search  
**Location**: `web/src/app/(billing)/invoices/search/page.tsx`  
**Components Needed**:
- SearchFilters (date range, invoice number, patient name)
- InvoiceList (display matching invoices)
- InvoiceDetail (full invoice details)

**Mock Data**: Load from localStorage

---

## ESTIMATED EFFORT

| Priority | Tasks | Complexity | Hours |
|----------|-------|-----------|-------|
| **P1** | Critical bugs (5 items) | Low-Medium | 5-6 |
| **P2** | New pages + workflows (3 items) | Medium-High | 12-14 |
| **P3** | Data persistence (4 items) | Medium | 6-8 |
| **P4** | Real-time updates (2 items) | Medium | 4-5 |
| **P5** | Form validation (3 items) | Low | 3-4 |
| **P6** | Navigation fixes (3 items) | Low-Medium | 3-4 |
| **P7** | New pages (3 pages) | Medium-High | 8-10 |
| **Total** | All fixes | Various | **42-51 hours** |

---

## IMPLEMENTATION SEQUENCE

**Session 1 (Now - 8 hours)**:
- [x] P1: Fix all 5 critical bugs
- [x] P5: Complete form validation fixes
- [x] P6: Fix navigation/workflow issues

**Session 2 (Tomorrow - 10 hours)**:
- [x] P2: Create Shift Handover page + components
- [x] P2: Create Controlled Drug Register page

**Session 3 (Day 3 - 8 hours)**:
- [x] P3: Implement data persistence for vitals, MAR, lab, invoices
- [x] P7: Create Invoice Search page

**Session 4 (Day 4 - 8 hours)**:
- [x] P4: Implement real-time queue + stats updates
- [x] Testing & verification of all workflows

**Session 5 (Day 5 - 8 hours)**:
- [x] Mobile responsiveness cleanup (27 pages)
- [x] Final testing & bug fixes

---

## SUCCESS CRITERIA

✅ All 5 critical bugs fixed  
✅ New Shift Handover page fully functional  
✅ New Controlled Drug Register page functional  
✅ All forms validate and persist to localStorage  
✅ All workflows complete end-to-end with demo data  
✅ Queue updates in real-time (simulated)  
✅ All dashboards show calculated stats  
✅ Zero TypeScript errors  
✅ Zero console errors  
✅ Mobile-responsive on all pages  
✅ All buttons functional (no console errors)  

---

## NOTES

- **No Backend**: All persistence is localStorage only
- **Demo Data**: Use realistic hospital data (patient names, drug names, etc.)
- **Mock Timestamps**: Use current time for all entries
- **localStorage Keys**: Prefix with `hms_` (e.g., `hms_patients`, `hms_encounters`)
- **No Payment Gateway**: Just show mock success message
- **No SMS Gateway**: Just show message "SMS sent to [Doctor]"

