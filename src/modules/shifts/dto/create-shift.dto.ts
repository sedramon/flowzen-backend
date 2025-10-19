import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn, IsNumber, IsMongoId } from 'class-validator';

export class CreateShiftDto {
  @ApiProperty({ description: 'Tenant ID' })
  @IsMongoId()
  @IsNotEmpty()
      tenant: string;

  @ApiProperty({ description: 'Facility ID' })
  @IsMongoId()
  @IsNotEmpty()
      facility: string;

  @ApiProperty({ description: 'Shift value' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['morning', 'afternoon', 'evening', 'full', 'custom'])
      value: string;

  @ApiProperty({ description: 'Shift label' })
  @IsString()
  @IsNotEmpty()
      label: string;

  @ApiProperty({ description: 'Shift color' })
  @IsString()
  @IsNotEmpty()
      color: string;

  @ApiProperty({ description: 'Shift start hour' })
  @IsOptional()
  @IsNumber()
      startHour?: number;

  @ApiProperty({ description: 'Shift end hour' })
  @IsOptional()
  @IsNumber()
      endHour?: number;
}