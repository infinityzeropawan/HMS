import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class InvoiceLineDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  hsnSacCode?: string;

  @IsNumber()
  @IsOptional()
  gstRate?: number;
}

export class CreateInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsUUID()
  @IsOptional()
  encounterId?: string;

  @IsArray()
  items: InvoiceLineDto[];
}
