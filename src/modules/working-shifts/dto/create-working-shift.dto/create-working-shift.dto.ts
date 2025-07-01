import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsMongoId } from 'class-validator';

export class CreateWorkingShiftDto {
  @IsMongoId()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  date: string; // ISO string

  @IsEnum(['morning', 'afternoon', 'evening', 'full', 'custom'])
  shiftType: string;

  @IsOptional()
  @IsNumber()
  startHour?: number;

  @IsOptional()
  @IsNumber()
  endHour?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsMongoId()
  tenantId: string;
}
