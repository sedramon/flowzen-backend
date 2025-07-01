import { IsString, IsNotEmpty, IsOptional, IsIn, IsNumber } from 'class-validator';

export class CreateShiftDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['morning', 'afternoon', 'evening', 'full', 'custom'])
  value: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsOptional()
  @IsNumber()
  startHour?: number;

  @IsOptional()
  @IsNumber()
  endHour?: number;
}