# SKILL: Multi-Tenancy Resolution & Storage Isolation

<!-- Source: Extracted Tenant Resolution and Isolation Rules -->

## 1. Tenant Resolution Flow
Every inbound HTTP request must resolve tenant context following this evaluation chain:
1. **Subdomain Extraction**: Extract subdomain from Host header (`apollo.hms-saas.com` -> `apollo`).
2. **JWT Claim Verification**: Verify `tenant_id` and `hospital_id` present in signed JWT token.
3. **Mismatch / Failure Handling**: If missing or subdomain does not match JWT claim, abort request immediately with HTTP `403 Forbidden` (`TENANT_MISMATCH`).

## 2. Storage Path Conventions
All S3 / object storage file uploads (patient documents, lab PDFs, DICOM scans, logos) MUST use the following tenant-partitioned path structure:

```
s3://hms-medical-records/{tenant_id}/{hospital_id}/{entity_type}/{year}/{month}/{file_id}.pdf
```

## 3. Cache Key Prefixing
All Redis cache keys MUST include tenant namespace prefixes:

```
tenant:{tenant_id}:hospital:{hospital_id}:user:{user_id}:permissions
tenant:{tenant_id}:hospital:{hospital_id}:queue:today
```

## 4. Background Job Payload Propagation
When dispatching asynchronous queues (BullMQ / RabbitMQ), job payloads MUST explicitly pass tenant context:

```json
{
  "jobId": "job_12345",
  "tenantId": "8f3b2a1c-...",
  "hospitalId": "11223344-...",
  "action": "GENERATE_LAB_REPORT_PDF",
  "payload": { "labOrderId": "998877..." }
}
```
Worker processes MUST initialize DB session RLS settings prior to processing job steps.
