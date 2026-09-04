import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RequestWithTenantContext } from '../tenants/tenant-context.middleware';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async findAll(@Req() req: RequestWithTenantContext) {
    const data = await this.invoicesService.findAll(
      req.tenantContext?.tenantId,
      req.tenantContext?.hospitalId,
    );
    return { success: true, data };
  }

  @Post()
  async create(@Req() req: RequestWithTenantContext, @Body() dto: CreateInvoiceDto) {
    const data = await this.invoicesService.create(
      req.tenantContext?.tenantId,
      req.tenantContext?.hospitalId,
      dto,
    );
    return { success: true, data, message: 'Invoice generated successfully' };
  }
}
