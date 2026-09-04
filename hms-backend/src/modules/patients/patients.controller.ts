import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantContextGuard, RequestWithTenantContext } from '../tenants/tenant-context.guard';

@Controller('patients')
@UseGuards(JwtAuthGuard, TenantContextGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async findAll(@Req() req: RequestWithTenantContext) {
    const data = await this.patientsService.findAll(
      req.tenantContext!.tenantId,
      req.tenantContext!.hospitalId,
    );
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Req() req: RequestWithTenantContext, @Param('id') id: string) {
    const data = await this.patientsService.findOne(
      req.tenantContext!.tenantId,
      req.tenantContext!.hospitalId,
      id,
    );
    return { success: true, data };
  }

  @Post()
  async create(@Req() req: RequestWithTenantContext, @Body() dto: CreatePatientDto) {
    const data = await this.patientsService.create(
      req.tenantContext!.tenantId,
      req.tenantContext!.hospitalId,
      dto,
    );
    return { success: true, data, message: 'Patient registered successfully' };
  }
}
