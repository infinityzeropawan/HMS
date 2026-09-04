import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';

@Injectable()
export class HospitalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.hospital.findMany({ where: { tenantId } });
  }

  async create(tenantId: string, dto: CreateHospitalDto) {
    return this.prisma.hospital.create({
      data: {
        tenantId,
        name: dto.name,
        facilityType: dto.facilityType,
        gstin: dto.gstin,
      },
    });
  }
}
