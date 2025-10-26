import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateWaitlistDto {
  @ApiProperty({ description: 'ID of the client' })
  @IsMongoId()
  @IsNotEmpty()
      client: string;

  @ApiProperty({ description: 'ID of the employee' })
  @IsMongoId()
  @IsNotEmpty()
      employee: string;

  @ApiProperty({ description: 'ID of the service' })
  @IsMongoId()
  @IsNotEmpty()
      service: string;

  @ApiProperty({ description: 'ID of the tenant' })
  @IsMongoId()
  @IsNotEmpty()
      tenant: string;

  @ApiProperty({ description: 'ID of the facility' })
  @IsMongoId()
  @IsNotEmpty()
      facility: string;

  @ApiProperty({ description: 'Preferred appointment date (ISO string)' })
  @IsDateString()
  @IsNotEmpty()
      preferredDate: string;

  @ApiProperty({ description: 'Preferred start time (number)' })
  @IsNumber()
  @IsNotEmpty()
      preferredStartHour: number;

  @ApiProperty({ description: 'Preferred end time (number)' })
  @IsNumber()
  @IsNotEmpty()
      preferredEndHour: number;
}
