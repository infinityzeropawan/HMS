import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { RequestWithTenantContext } from '../tenants/tenant-context.middleware';

@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  @Get()
  async findAll(@Req() req: RequestWithTenantContext) {
    const data = await this.hospitalsService.findAll(req.tenantContext?.tenantId);
    return { success: true, data };
  }

  @Post()
  async create(@Req() req: RequestWithTenantContext, @Body() dto: CreateHospitalDto) {
    const data = await this.hospitalsService.create(req.tenantContext?.tenantId, dto);
    return { success: true, data };
  }
}
