import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsMongoId } from 'class-validator';

export class CreateWorkingShiftDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsMongoId()
  @IsNotEmpty()
      employee: string;

  @ApiProperty({ description: 'Shift date (ISO string)' })
  @IsString()
  @IsNotEmpty()
      date: string; // ISO string

  @ApiProperty({ description: 'Shift type' })
  @IsNotEmpty()
  @IsEnum(['morning', 'afternoon', 'evening', 'full', 'custom'])
      shiftType: string;

  @ApiProperty({ description: 'Shift start hour' })
  @IsOptional()
  @IsNumber()
      startHour?: number;

  @ApiProperty({ description: 'Shift end hour' })
  @IsOptional()
  @IsNumber()
      endHour?: number;

  @ApiProperty({ description: 'Shift note' })
  @IsOptional()
  @IsString()
      note?: string;

  @ApiProperty({ description: 'Tenant ID' })
  @IsNotEmpty()
  @IsMongoId()
      tenant: string;

  @ApiProperty({ description: 'Facility ID' })
  @IsNotEmpty()
  @IsMongoId()
      facility: string;
}
