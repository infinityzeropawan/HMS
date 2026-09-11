# Backend Security & Tenant Isolation Skill

## Rule 1: Request Lifecycle Awareness (NestJS)
NestJS execution order is: Middleware -> Guards -> Interceptors -> Pipes -> Controller.
- `req.user` is set by Guards (e.g. JwtAuthGuard), NOT by Middleware.
- NEVER read `req.user` inside a Middleware — it will be undefined.
- Any logic that depends on authenticated user identity (tenant resolution,
  role checks, ownership checks) MUST be implemented as a Guard registered
  to run AFTER the auth guard, never as global Middleware.
- Tenant/hospital context must be derived from verified JWT claims first.
  Raw request headers (X-Tenant-ID, X-Hospital-ID) may only be trusted
  for unauthenticated routes (e.g. login) — never as the source of truth
  once a user is authenticated.

## Rule 2: Tenant Isolation Enforcement (Mandatory, Not Optional)
- Every Prisma query on a tenant-scoped model MUST include
  `tenantId` and `hospitalId` explicitly in the `where` clause.
  This is the PRIMARY enforcement layer in Phase 1 — do not assume
  database-level RLS is active unless explicitly verified.
- Never write a service method that accepts an `id` alone without also
  requiring `tenantId`/`hospitalId` as parameters and filtering by them.
- Before writing any new repository/service method, check
  .agents/skills/database.md and confirm the query pattern matches
  the mandatory filtering rule.

## Rule 3: PostgreSQL Session Variables (SET LOCAL / RLS)
- `SET LOCAL` only persists within the current transaction. Prisma's
  connection pool means a standalone `$executeRawUnsafe('SET LOCAL ...')`
  call is NOT guaranteed to apply to subsequent queries unless everything
  runs inside the same `$transaction()` block.
- If real Postgres RLS is required, wrap the entire request's DB access
  in `prisma.$transaction(async (tx) => { ... })` and use `tx` for every
  query in that request — never issue `SET LOCAL` on the base client
  and then query with a fresh call.
- Do not claim RLS is "enforced" unless this pattern is verified with
  an actual test that proves cross-tenant queries return zero rows.

## Rule 4: Never Interpolate Raw Values into SQL
- Never use `$executeRawUnsafe` or string interpolation with
  user-supplied or header-supplied values (tenantId, hospitalId, search
  terms, etc.).
- Always use parameterized queries: `$executeRaw` with `Prisma.sql` or
  `$1`/`$2` placeholders, or `set_config('key', $1, true)`.
- Validate any ID that will touch raw SQL as a proper UUID (regex or
  library check) before use, even when using parameterized queries.

## Rule 5: Self-Check Before Declaring a Feature Complete
Before saying "done" on any backend feature, explicitly verify and state:
1. Which guard(s) protect this route, and in what order.
2. Which fields the query filters by (must include tenantId/hospitalId).
3. Whether any raw SQL is used, and whether it's parameterized.
4. Whether a test exists proving tenant A cannot see tenant B's data.
If any of these four cannot be answered, the feature is NOT complete.
