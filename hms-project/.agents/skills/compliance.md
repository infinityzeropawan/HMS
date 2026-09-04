# SKILL: Regulatory Compliance Framework (ABDM, DPDP 2023, GST, Telemedicine, NABH)

<!-- Source: Extracted ABDM, DPDP 2023, Telemedicine, GST, NABH rules and PR checks -->

## 1. Regulatory Requirements Overview

- **ABDM (Ayushman Bharat Digital Mission)**:
  - M1: ABHA Number & Address creation/verification.
  - M2: Health Information Provider (HIP) care-context linkage.
  - M3: Health Information User (HIU) consent & FHIR bundle processing.
- **DPDP Act 2023 (Digital Personal Data Protection)**:
  - Digital consent artifacts stored in `consent_artefacts`.
  - Data processor tracking in `data_processors` and `data_processor_access_logs`.
  - Right to erase & data minimization (mask Aadhaar to last 4 digits: `aadhaar_masked`).
- **Telemedicine Practice Guidelines 2020**:
  - Verification of doctor NMC Registration Number (`nmc_registration_no`).
  - Explicit patient consent before starting video/chat session.
- **GST Invoicing**:
  - Healthcare consultation: Exempt / 0% GST (SAC `999312`).
  - Medicines: 12% / 5% GST (HSN `3004`).
- **NABH / NABL Accreditation**:
  - Maintenance of `medication_errors` and `adverse_events` logs for quality audits.

---

## 2. Mandatory PR Checks for AI Agents

Every Pull Request or code modification touching `patient`, `consent`, `billing`, or `ai` modules MUST enforce:
1. [ ] **Audit Log Trigger**: Verify `audit_logs` record created on PII access/update.
2. [ ] **Consent Check**: Verify explicit consent record exists before serving health data.
3. [ ] **Masked PII**: Confirm no raw Aadhaar or full payment card numbers are logged or returned in APIs.
4. [ ] **GST Precision**: Ensure invoice tax calculation uses `NUMERIC(12,2)` precision.
5. [ ] **No Auto AI Action**: AI clinical suggestions must require doctor signature (`signed_by`).
