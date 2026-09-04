# WORKFLOW: Scaffolding a New Module (/new-module)

<!-- Source: Extracted /new-module workflow step-by-step instructions -->

Follow these exact steps when executing the `/new-module` command to scaffold a new business domain module:

---

## Step 1: Database Entity & Migration
1. Create migration file in `backend/migrations/` defining the PostgreSQL DDL.
2. Add `id`, `tenant_id`, `hospital_id`, `created_at`, `updated_at`, `deleted_at`.
3. Enable RLS:
   ```sql
   ALTER TABLE <module_table> ENABLE ROW LEVEL SECURITY;
   CREATE POLICY tenant_isolation_<module_table> ON <module_table>
       USING (tenant_id = current_setting('app.current_tenant_id')::uuid
              AND hospital_id = current_setting('app.current_hospital_id')::uuid);
   ```

---

## Step 2: Backend Architecture Layers
Create the following modular files under `backend/src/modules/<module-name>/`:
- `<module-name>.entity.ts`: TypeScript entity definition.
- `<module-name>.dto.ts`: Input validation schema (Zod / class-validator).
- `<module-name>.repository.ts`: Database access layer enforcing `tenant_id` & `hospital_id`.
- `<module-name>.service.ts`: Business logic and audit logging invocation.
- `<module-name>.controller.ts`: REST controller routes with RBAC guards.

---

## Step 3: API Specification & Documentation Update
- Append endpoint definitions to `docs/api-spec.md` with request/response schemas.
- Update canonical schema references in `docs/erd.md`.
