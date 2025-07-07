import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsMongoId, IsOptional } from 'class-validator';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsOptional()
  @IsMongoId()
  employeeId?: string;

  @IsOptional()
  @IsMongoId()
  tenantId?: string;
}