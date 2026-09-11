# SKILL: Regulatory Compliance Framework (ABDM, DPDP 2023, GST, Telemedicine, NABH, Multi-Tenancy)

<!-- Source: ABDM, DPDP 2023, Telemedicine, GST, NABH rules, PACS/DICOM, & PR verification checks -->

## 1. Regulatory Requirements Overview

- **ABDM (Ayushman Bharat Digital Mission)**:
  - M1: ABHA Number & Address creation/verification.
  - M2: Health Information Provider (HIP) care-context linkage.
  - M3: Health Information User (HIU) consent & FHIR R4 bundle processing (`/gateway`).
- **DPDP Act 2023 (Digital Personal Data Protection)**:
  - Digital consent artifacts stored in `consent_artefacts` & managed via `/portal`.
  - Data processor tracking in `data_processors` and `data_processor_access_logs`.
  - Right to erase & data minimization (mask Aadhaar to last 4 digits: `aadhaar_masked` -> `XXXX-XXXX-1234`).
  - Immutable audit trail display at `/audit-logs` (no edit/delete UI controls).
- **Telemedicine Practice Guidelines 2020**:
  - Verification of doctor NMC Registration Number (`nmc_registration_no`).
  - Explicit patient consent before starting video/chat session (`/consult/[sessionNo]`).
- **GST Invoicing**:
  - Healthcare consultation: Exempt / 0% GST (SAC `999312`).
  - Medicines: 12% / 5% GST (HSN `3004`).
  - Split tax rendering: CGST (9%) + SGST (9%) with `NUMERIC(12,2)` precision (`/invoices`).
- **NABH / NABL Accreditation**:
  - FEFO (First-Expiry, First-Out) batch tracking modal (`/dispense`).
  - Laboratory panic value alert triggers (<7.0 g/dL Hb) with critical value popup (`/orders`).
  - Maintenance of `medication_errors` and `adverse_events` logs for quality audits.
- **AI Clinical Suggestions**:
  - Render with `<HmsAiGeneratedBadge />` ("AI Draft — Needs Physician Confirmation").
  - Lock e-Prescription and Discharge PDF print until physician explicit digital signature (`signed_at`).

---

## 2. Mandatory PR Checks for AI Agents

Every Pull Request or code modification touching `patient`, `consent`, `billing`, `clinical`, `lab`, or `ai` modules MUST enforce:
1. [x] **Audit Log Trigger**: Verify `audit_logs` record created on PII access/update.
2. [x] **Consent Check**: Verify explicit consent record exists before serving health data.
3. [x] **Masked PII**: Confirm no raw Aadhaar or full payment card numbers are logged or returned in APIs.
4. [x] **GST Precision**: Ensure invoice tax calculation uses `NUMERIC(12,2)` precision.
5. [x] **No Auto AI Action**: AI clinical suggestions must require doctor signature (`signed_by`).
6. [x] **Print Lock**: PDF export/print blocked until `signed_at` timestamp is set.
