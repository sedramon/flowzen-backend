import { IsString, IsNotEmpty, IsOptional, IsIn, IsNumber, IsMongoId } from 'class-validator';

export class CreateShiftDto {
  @IsMongoId()
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