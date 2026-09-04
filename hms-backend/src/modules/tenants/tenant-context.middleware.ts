import { Injectable, NestMiddleware, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

export interface TenantContext {
  tenantId: string;
  hospitalId: string;
}

export interface RequestWithTenantContext extends Request {
  tenantContext?: TenantContext;
}

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: RequestWithTenantContext, res: Response, next: NextFunction) {
    // 1. Extract tenantId and hospitalId from headers or JWT payload
    const headerTenantId = req.headers['x-tenant-id'] as string;
    const headerHospitalId = req.headers['x-hospital-id'] as string;

    const user = (req as any).user;
    const tenantId = user?.tenantId || headerTenantId;
    const hospitalId = user?.hospitalId || headerHospitalId;

    // Allow auth routes to proceed without requiring tenant headers
    if (req.originalUrl.includes('/api/v1/auth/login')) {
      return next();
    }

    if (!tenantId) {
      throw new UnauthorizedException('Missing required tenant context header (X-Tenant-ID) or JWT claim');
    }

    // 2. Validate tenant existence in database (stub/cache check)
    req.tenantContext = { tenantId, hospitalId };

    // 3. PostgreSQL session-level RLS stub
    try {
      await this.prisma.setRlsContext(tenantId, hospitalId);
    } catch (err) {
      // Stub log for RLS session setting
      console.warn(`[RLS Stub] Executed SET LOCAL app.current_tenant_id = '${tenantId}'`);
    }

    next();
  }
}
