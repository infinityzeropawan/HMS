import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { RequestWithTenantContext } from '../tenants/tenant-context.middleware';

@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Get()
  async findAll(@Req() req: RequestWithTenantContext) {
    const data = await this.prescriptionsService.findAll(
      req.tenantContext?.tenantId,
      req.tenantContext?.hospitalId,
    );
    return { success: true, data };
  }

  @Post()
  async create(@Req() req: RequestWithTenantContext, @Body() dto: CreatePrescriptionDto) {
    const data = await this.prescriptionsService.create(
      req.tenantContext?.tenantId,
      req.tenantContext?.hospitalId,
      dto,
    );
    return { success: true, data, message: 'Prescription created successfully' };
  }
}
