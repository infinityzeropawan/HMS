import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Session-level PostgreSQL Row-Level Security (RLS) execution helper.
   *
   * NOTE / WARNING FOR PHASE 1:
   * PostgreSQL session variables (via SET LOCAL or set_config(..., true)) are scoped to a single
   * database transaction or connection. Because Prisma maintains a connection pool, un-transactional
   * queries may run on different connections where session variables are not preserved.
   *
   * Therefore, IN PHASE 1, DO NOT RELY ON RLS SESSION VARIABLES FOR SECURITY ENFORCEMENT.
   * ALL PRISMA QUERIES IN EVERY SERVICE METHOD MUST EXPLICITLY INCLUDE:
   * `where: { tenantId, hospitalId, deletedAt: null }`
   *
   * Full database-level RLS policy enforcement across pooled connections is planned for Phase 2.
   */
  async setRlsContext(tenantId: string, hospitalId: string): Promise<void> {
    if (tenantId && UUID_REGEX.test(tenantId)) {
      await this.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true);`;
    }
    if (hospitalId && UUID_REGEX.test(hospitalId)) {
      await this.$executeRaw`SELECT set_config('app.current_hospital_id', ${hospitalId}, true);`;
    }
  }
}
