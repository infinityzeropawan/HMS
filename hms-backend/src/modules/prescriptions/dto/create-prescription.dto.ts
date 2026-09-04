import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class PrescriptionItemDto {
  @IsString()
  @IsNotEmpty()
  drugName: string;

  @IsString()
  @IsOptional()
  dosage?: string;

  @IsString()
  @IsOptional()
  frequency?: string;
}

export class CreatePrescriptionDto {
  @IsUUID()
  @IsNotEmpty()
  encounterId: string;

  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @IsArray()
  @IsOptional()
  items?: PrescriptionItemDto[];
}
