import { IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAppointmentDto {
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
