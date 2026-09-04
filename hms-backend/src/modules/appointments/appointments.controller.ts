import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RequestWithTenantContext } from '../tenants/tenant-context.middleware';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  async findAll(@Req() req: RequestWithTenantContext) {
    const data = await this.appointmentsService.findAll(
      req.tenantContext?.tenantId,
      req.tenantContext?.hospitalId,
    );
    return { success: true, data };
  }

  @Post()
  async create(@Req() req: RequestWithTenantContext, @Body() dto: CreateAppointmentDto) {
    const data = await this.appointmentsService.create(
      req.tenantContext?.tenantId,
      req.tenantContext?.hospitalId,
      dto,
    );
    return { success: true, data, message: 'Appointment booked successfully' };
  }
}
