import { IsDate, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @IsMongoId() 
  serviceId: string;

  @IsMongoId()
  userId: string;

  @Type(() => Date)
  @IsDate()
  date: Date;
}
