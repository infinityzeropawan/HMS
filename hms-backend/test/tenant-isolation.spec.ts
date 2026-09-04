import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PatientsService } from '../src/modules/patients/patients.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { TenantContextGuard } from '../src/modules/tenants/tenant-context.guard';

describe('Tenant Isolation & Guard Security (E2E / Integration)', () => {
  let patientsService: PatientsService;
  let tenantGuard: TenantContextGuard;

  const mockPrismaService = {
    patient: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    setRlsContext: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        TenantContextGuard,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    patientsService = module.get<PatientsService>(PatientsService);
    tenantGuard = module.get<TenantContextGuard>(TenantContextGuard);
    jest.clearAllMocks();
  });

  describe('1. Application-Level Query Isolation', () => {
    it('Tenant B cannot see Tenant A patients via findAll', async () => {
      const tenantA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      const tenantB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
      const hospitalB = 'hospbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

      mockPrismaService.patient.findMany.mockImplementation(({ where }) => {
        // Enforce mock matching actual Prisma where clause
        if (where.tenantId === tenantB && where.hospitalId === hospitalB) {
          return Promise.resolve([]); // Returns 0 rows for Tenant B
        }
        return Promise.resolve([{ id: 'patient-a', tenantId: tenantA }]);
      });

      const result = await patientsService.findAll(tenantB, hospitalB);

      expect(result).toEqual([]);
      expect(mockPrismaService.patient.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: tenantB,
          hospitalId: hospitalB,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('Tenant B searching for Patient A ID returns 404 / NotFoundException', async () => {
      const tenantB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
      const hospitalB = 'hospbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
      const patientAId = 'patient-a-id';

      mockPrismaService.patient.findFirst.mockResolvedValue(null);

      await expect(
        patientsService.findOne(tenantB, hospitalB, patientAId),
      ).rejects.toThrow('Patient with ID \'patient-a-id\' not found in current tenant scope');

      expect(mockPrismaService.patient.findFirst).toHaveBeenCalledWith({
        where: {
          id: patientAId,
          tenantId: tenantB,
          hospitalId: hospitalB,
          deletedAt: null,
        },
        include: {
          identifiers: true,
        },
      });
    });
  });

  describe('2. TenantContextGuard Header Spoof Protection', () => {
    function createMockContext(user: any, headers: Record<string, string>): ExecutionContext {
      return {
        switchToHttp: () => ({
          getRequest: () => ({
            user,
            headers,
            originalUrl: '/api/v1/patients',
          }),
        }),
      } as any;
    }

    it('Rejects forged X-Tenant-ID header mismatched from verified JWT claim with 403 Forbidden', async () => {
      const mockUser = {
        userId: 'user-1',
        email: 'user@tenantb.com',
        tenantId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        hospitalId: 'hospbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        role: 'DOCTOR',
      };

      // Attacker sends header X-Tenant-ID for Tenant A while JWT is for Tenant B
      const forgedHeaders = {
        'x-tenant-id': 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      };

      const context = createMockContext(mockUser, forgedHeaders);

      await expect(tenantGuard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('Passes and extracts tenantContext correctly when JWT claim and headers match', async () => {
      const mockUser = {
        userId: 'user-1',
        email: 'user@tenantb.com',
        tenantId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        hospitalId: 'hospbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        role: 'DOCTOR',
      };

      const validHeaders = {
        'x-tenant-id': 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'x-hospital-id': 'hospbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      };

      const req: any = {
        user: mockUser,
        headers: validHeaders,
        originalUrl: '/api/v1/patients',
      };

      const context = {
        switchToHttp: () => ({ getRequest: () => req }),
      } as any;

      const result = await tenantGuard.canActivate(context);

      expect(result).toBe(true);
      expect(req.tenantContext).toEqual({
        tenantId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        hospitalId: 'hospbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      });
    });
  });
});
