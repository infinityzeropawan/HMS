import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHospitalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  facilityType?: string;

  @IsString()
  @IsOptional()
  gstin?: string;
}
