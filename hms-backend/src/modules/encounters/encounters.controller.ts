import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { EncountersService } from './encounters.service';
import { CreateEncounterDto } from './dto/create-encounter.dto';
import { RequestWithTenantContext } from '../tenants/tenant-context.middleware';

@Controller('encounters')
export class EncountersController {
  constructor(private readonly encountersService: EncountersService) {}

  @Get()
  async findAll(@Req() req: RequestWithTenantContext) {
    const data = await this.encountersService.findAll(
      req.tenantContext?.tenantId,
      req.tenantContext?.hospitalId,
    );
    return { success: true, data };
  }

  @Post()
  async create(@Req() req: RequestWithTenantContext, @Body() dto: CreateEncounterDto) {
    const data = await this.encountersService.create(
      req.tenantContext?.tenantId,
      req.tenantContext?.hospitalId,
      dto,
    );
    return { success: true, data, message: 'Encounter created successfully' };
  }
}
