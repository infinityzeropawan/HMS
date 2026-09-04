import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, hospitalId: string) {
    return this.prisma.prescription.findMany({
      where: { tenantId, hospitalId },
      include: { items: true },
    });
  }

  async create(tenantId: string, hospitalId: string, dto: CreatePrescriptionDto) {
    return this.prisma.prescription.create({
      data: {
        tenantId,
        hospitalId,
        encounterId: dto.encounterId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        status: 'active',
        items: {
          create: dto.items?.map((item) => ({
            tenantId,
            hospitalId,
            drugName: item.drugName,
            dosage: item.dosage,
            frequency: item.frequency,
          })),
        },
      },
    });
  }
}
