import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, hospitalId: string) {
    return this.prisma.user.findMany({
      where: { tenantId, hospitalId },
      select: { id: true, fullName: true, email: true, userType: true },
    });
  }
}
