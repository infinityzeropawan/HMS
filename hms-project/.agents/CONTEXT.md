# Project Memory — Architecture, Rules & Constraints

<!-- Source: Non-negotiable architecture & compliance rules -->

## 1. Core Architecture Principles & Non-Negotiable Rules

- **Current Implementation Phase**: Phase 1 (Core Multi-Tenancy, Patient Registration UHID, OPD Appointments, EMR SOAP Notes & eRx, Basic Billing & GST).
- **Canonical Database Schema Location**: [docs/erd.md](file:///home/pawan/Desktop/hospital/hms-project/docs/erd.md).

---

## 2. Mandatory Rules & Guardrails

- **Tenant Isolation**:
  - Every tenant database table MUST contain both `tenant_id UUID` and `hospital_id UUID` columns.
  - Queries MUST operate under Postgres Row Level Security (RLS) or explicitly bind `WHERE tenant_id = :tenant_id AND hospital_id = :hospital_id`.
  - Do NOT accept `tenant_id` directly from untrusted user request bodies; extract it from verified JWT claims server-side.

- **Regulatory Compliance**:
  - **ABDM**: All clinical health records linked to ABHA ID MUST conform to FHIR R4 JSON standards.
  - **DPDP Act 2023**: Data minimization is mandatory. Store Aadhaar only as masked (`aadhaar_masked`, last 4 digits). Record explicit digital consent artifacts before data sharing.
  - **GST**: Invoices must calculate CGST, SGST, and IGST accurately with valid HSN/SAC codes.

- **AI Safety & Autonomous Actions**:
  - Do NOT execute automated clinical actions (e.g. auto-submitting prescriptions or modifying lab values) without explicit physician sign-off (`signed_by`, `signed_at`).
