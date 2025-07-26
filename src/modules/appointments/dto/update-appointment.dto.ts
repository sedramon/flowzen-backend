import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class UpdateAppointmentDto {
  @IsMongoId()
  @IsNotEmpty()
  employee: string;

  @IsMongoId()
  @IsNotEmpty()
  client: string;

  @IsMongoId()
  @IsNotEmpty()
  tenant: string;

  @IsMongoId()
  @IsNotEmpty()
  service: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  startHour: number;

  @IsNumber()
  @IsNotEmpty()
  endHour: number;
}
