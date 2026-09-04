# /security-review

When invoked on a set of changed files:
1. Re-read .agents/skills/backend-security.md and .agents/skills/multi-tenancy.md.
2. For every new Guard/Middleware: confirm execution order matches Rule 1.
3. For every new Prisma query: confirm tenantId + hospitalId are in the where clause.
4. For every raw SQL usage: confirm it is parameterized, not interpolated.
5. Run `semgrep --config .semgrep/rules.yaml <changed files>` and report findings.
6. Write a short PASS/FAIL report per rule — do not just say "looks good."
   If any rule fails, list the exact file/line and propose a fix.
Do not implement new features while this workflow is running — review only.
