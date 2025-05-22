import { IsDateString, IsMongoId, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsMongoId()
  employeeId: string;

  @IsString()
  serviceName: string;

  @IsDateString()
  date: string;

  startHour: number;
  endHour: number;
}
