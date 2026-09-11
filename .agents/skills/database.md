# SKILL: Database Conventions, DDL Rules & Schema Governance

<!-- Source: Extracted Database Rules and Schema Governance -->

## 1. Audit Columns Requirement
Every table in the HMS schema (except platform-level global tables) MUST include standard audit columns:

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
hospital_id UUID NOT NULL REFERENCES hospitals(id),
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
created_by UUID,
updated_by UUID,
deleted_at TIMESTAMPTZ  -- soft delete
```

## 2. Soft-Delete Policy
- Never execute hard `DELETE FROM <table>` on core medical tables (`patients`, `encounters`, `prescriptions`, `invoices`).
- Perform soft deletion by setting `deleted_at = NOW()`.
- Active queries MUST include `WHERE deleted_at IS NULL`.

## 3. Foreign Key Deletion Rules
- **No CASCADE Deletes on Clinical Records**: Clinical tables (`encounters`, `prescriptions`, `lab_orders`, `invoices`) must NOT use `ON DELETE CASCADE` for patient or user foreign keys. Use `RESTRICT` or prevent deletion to preserve legal health records.

## 4. Row Level Security (RLS) Policy Pattern
```sql
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_patients ON patients
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid
           AND hospital_id = current_setting('app.current_hospital_id')::uuid);
```
