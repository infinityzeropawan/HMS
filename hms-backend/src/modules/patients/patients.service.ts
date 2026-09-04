import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch all active patients for the given tenant and hospital context.
   * MANDATORY PATTERN: Every Prisma query MUST explicitly scope by tenantId, hospitalId, and deletedAt.
   */
  async findAll(tenantId: string, hospitalId: string) {
    return this.prisma.patient.findMany({
      where: {
        tenantId,
        hospitalId,
        deletedAt: null, // Soft-delete filter
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find a single patient by ID with strict tenant and hospital isolation.
   */
  async findOne(tenantId: string, hospitalId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id: patientId,
        tenantId,
        hospitalId,
        deletedAt: null,
      },
      include: {
        identifiers: true,
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID '${patientId}' not found in current tenant scope`);
    }

    return patient;
  }

  /**
   * Register a new patient in the current tenant & hospital context.
   */
  async create(tenantId: string, hospitalId: string, dto: CreatePatientDto) {
    const uhid = `UHID-${Date.now().toString().slice(-6)}`;
    return this.prisma.patient.create({
      data: {
        tenantId,
        hospitalId,
        uhid,
        firstName: dto.firstName,
        lastName: dto.lastName,
        gender: dto.gender,
        mobile: dto.mobile,
        abhaNumber: dto.abhaNumber,
      },
    });
  }
}
