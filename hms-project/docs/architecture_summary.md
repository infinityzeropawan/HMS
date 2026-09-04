# HMS Architecture — Executive Summary

<!-- Source: 1-page executive summary derived from architecture blueprint -->

## 1. Product Scope & Vision
The Hospital Management System (HMS) is an enterprise multi-tenant SaaS application designed to digitize clinical, financial, administrative, and compliance operations for healthcare institutions in India.

## 2. Supported Platforms & Form Factors
- **Web App (Desktop / Tablet)**: Next.js + React + Ant Design for doctors, nurses, receptionists, pharmacists, and billing admins.
- **Mobile Portal (PWA / Mobile)**: Offline-first capable mobile interface for patient self-service and doctor rounds.
- **Background Workers**: Node.js / BullMQ workers handling SMS/WhatsApp notifications, async ABDM FHIR bundle processing, and nightly billing sync.

## 3. Multi-Tenant Architecture Summary
- **Database Model**: Shared PostgreSQL database instance using **Row-Level Security (RLS)**.
- **Isolation Scope**: Every tenant table is isolated using composite keys `(tenant_id, hospital_id)`.
- **Tenant Resolution**: Inbound HTTP Request -> Subdomain / `X-Tenant-ID` header -> JWT Verification -> `SET LOCAL app.current_tenant_id = '<uuid>'`.

## 4. High-Level Implementation Phases
- **Phase 1 (Current)**: Core Multi-tenancy, Patient Registration (UHID), OPD Appointments, Clinical EMR (SOAP Notes, Prescriptions), Basic Billing & GST.
- **Phase 2**: IPD / Bed Management, Pharmacy Stock & Batch Tracking, LIS / RIS Lab & Radiology orders, ABDM Milestone 1 & 2 (ABHA ID link).
- **Phase 3**: TPA / Insurance Claim Workflow, Doctor Payout Engine, OT Scheduling, Blood Bank, ABDM Milestone 3 (HIU/HIP consent manager).
