import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, hospitalId: string) {
    return this.prisma.appointment.findMany({
      where: { tenantId, hospitalId },
      include: { patient: true, doctor: true },
    });
  }

  async create(tenantId: string, hospitalId: string, dto: CreateAppointmentDto) {
    return this.prisma.appointment.create({
      data: {
        tenantId,
        hospitalId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        appointmentDate: new Date(dto.appointmentDate),
        bookingChannel: dto.bookingChannel || 'walk_in',
        status: 'booked',
      },
    });
  }
}
