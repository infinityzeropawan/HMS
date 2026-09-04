import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEncounterDto } from './dto/create-encounter.dto';

@Injectable()
export class EncountersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, hospitalId: string) {
    return this.prisma.encounter.findMany({
      where: { tenantId, hospitalId },
      include: { patient: true, doctor: true },
    });
  }

  async create(tenantId: string, hospitalId: string, dto: CreateEncounterDto) {
    return this.prisma.encounter.create({
      data: {
        tenantId,
        hospitalId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        appointmentId: dto.appointmentId,
        chiefComplaint: dto.chiefComplaint,
        encounterType: 'opd',
        encounterStatus: 'open',
      },
    });
  }
}
