import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, hospitalId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId, hospitalId },
      include: { lines: true, patient: true },
    });
  }

  async create(tenantId: string, hospitalId: string, dto: CreateInvoiceDto) {
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    let subtotal = 0;
    let taxAmount = 0;

    const lines = dto.items.map((item) => {
      const lineTotal = item.unitPrice * item.quantity;
      const gst = ((item.gstRate || 0) * lineTotal) / 100;
      subtotal += lineTotal;
      taxAmount += gst;

      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        hsnSacCode: item.hsnSacCode || '999312',
        gstRate: item.gstRate || 0,
        lineTotal,
      };
    });

    return this.prisma.invoice.create({
      data: {
        tenantId,
        hospitalId,
        invoiceNumber,
        patientId: dto.patientId,
        encounterId: dto.encounterId,
        grossAmount: subtotal,
        taxAmount,
        netAmount: subtotal + taxAmount,
        paymentStatus: 'unpaid',
        lines: { create: lines },
      },
    });
  }
}
