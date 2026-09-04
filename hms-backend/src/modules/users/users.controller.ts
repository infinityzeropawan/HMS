import { Controller, Get, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { RequestWithTenantContext } from '../tenants/tenant-context.middleware';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Req() req: RequestWithTenantContext) {
    const data = await this.usersService.findAll(
      req.tenantContext?.tenantId,
      req.tenantContext?.hospitalId,
    );
    return { success: true, data };
  }
}
