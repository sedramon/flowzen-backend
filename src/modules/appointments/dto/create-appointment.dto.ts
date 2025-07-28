import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID of the employee' })
  @IsMongoId()
  @IsNotEmpty()
  employee: string;

  @ApiProperty({ description: 'ID of the client' })
  @IsMongoId()
  @IsNotEmpty()
  client: string;

  @ApiProperty({ description: 'ID of the tenant' })
  @IsMongoId()
  @IsNotEmpty()
  tenant: string;

  @ApiProperty({ description: 'ID of the service' })
  @IsMongoId()
  @IsNotEmpty()
  service: string;

  @ApiProperty({ description: 'Appointment date (ISO string)' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Appointment start time (number)' })
  @IsNumber()
  @IsNotEmpty()
  startHour: number;

  @ApiProperty({ description: 'Appointment start time (number)' })
  @IsNumber()
  @IsNotEmpty()
  endHour: number;
}
