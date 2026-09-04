import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEncounterDto {
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @IsUUID()
  @IsOptional()
  appointmentId?: string;

  @IsString()
  @IsOptional()
  chiefComplaint?: string;
}
