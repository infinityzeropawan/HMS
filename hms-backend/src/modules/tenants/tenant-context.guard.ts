import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

export interface TenantContext {
  tenantId: string;
  hospitalId: string;
}

export interface RequestWithTenantContext extends Request {
  user?: {
    userId: string;
    email: string;
    tenantId: string;
    hospitalId: string;
    role: string;
  };
  tenantContext?: TenantContext;
}

@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithTenantContext>();

    // 1. Primary source: Verified JWT payload from req.user (populated by JwtAuthGuard)
    const user = req.user;
    const headerTenantId = req.headers['x-tenant-id'] as string;
    const headerHospitalId = req.headers['x-hospital-id'] as string;

    let tenantId = user?.tenantId;
    let hospitalId = user?.hospitalId;

    // If authenticated via JWT, strictly enforce JWT claims over raw client headers
    if (user && user.tenantId) {
      // Security Check: If client sends a raw header, verify it matches signed JWT claim
      if (headerTenantId && headerTenantId !== user.tenantId) {
        throw new ForbiddenException('Tenant context mismatch: Raw header X-Tenant-ID does not match authenticated JWT claim');
      }
      if (headerHospitalId && user.hospitalId && headerHospitalId !== user.hospitalId) {
        throw new ForbiddenException('Hospital context mismatch: Raw header X-Hospital-ID does not match authenticated JWT claim');
      }
    } else {
      // Fallback for public / unauthenticated endpoints (e.g. login)
      tenantId = headerTenantId;
      hospitalId = headerHospitalId;
    }

    // Skip tenant verification for global auth/login endpoints
    if (req.originalUrl.includes('/api/v1/auth/login')) {
      return true;
    }

    if (!tenantId) {
      throw new UnauthorizedException('Missing required tenant context in JWT token or X-Tenant-ID header');
    }

    // Attach validated tenantContext to request object for downstream services
    req.tenantContext = { tenantId, hospitalId: hospitalId || '' };

    // Best-effort RLS session setting (best-effort stub for single connection scope)
    try {
      if (hospitalId) {
        await this.prisma.setRlsContext(tenantId, hospitalId);
      }
    } catch (err) {
      // Session setting log stub
    }

    return true;
  }
}
