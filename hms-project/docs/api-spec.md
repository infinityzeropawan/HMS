# TODO: extract endpoints from architecture.md

<!-- Source: Extracted API Specifications & OpenAPI Endpoints mapping for HMS -->

## 1. Global API Conventions & Envelopes

- **Base Path**: `/api/v1`
- **Authentication**: `Authorization: Bearer <jwt_token>`
- **Tenant Context**: `X-Tenant-ID: <tenant_uuid>` (verified against JWT claims)

### Success Response Envelope
```json
{
  "success": true,
  "data": {},
  "meta": { "timestamp": "2026-09-05T00:00:00Z" }
}
```

---

## 2. Core Domain API Endpoint List

| Method | Endpoint Path | Purpose | Primary Role |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate user & retrieve JWT token | Public |
| `POST` | `/api/v1/patients` | Register new patient & assign UHID | Receptionist |
| `GET` | `/api/v1/patients` | Search patient list (UHID, Name, Mobile) | Receptionist / Doctor |
| `POST` | `/api/v1/appointments` | Book OPD consultation slot | Receptionist / Patient |
| `GET` | `/api/v1/appointments/queue` | Fetch real-time token queue for doctor | Receptionist / Doctor |
| `POST` | `/api/v1/encounters` | Start new clinical consultation | Doctor |
| `POST` | `/api/v1/encounters/{id}/prescriptions` | Create e-Prescription (FHIR format) | Doctor |
| `POST` | `/api/v1/billing/invoices` | Generate GST tax invoice for OPD/IPD | Billing Admin |
| `POST` | `/api/v1/pharmacy/dispense` | Dispense medicine stock against eRx | Pharmacist |
| `POST` | `/api/v1/lab/orders` | Place diagnostic lab test order | Doctor |
| `POST` | `/api/v1/abdm/v3/abha/generate-otp` | Request Aadhaar OTP for ABHA creation | Receptionist / Patient |
