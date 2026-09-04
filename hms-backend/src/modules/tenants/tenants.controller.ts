import { Controller, Get, Param } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  async findAll() {
    const tenants = await this.tenantsService.findAll();
    return { success: true, data: tenants };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tenant = await this.tenantsService.findOne(id);
    return { success: true, data: tenant };
  }
}
