import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsMongoId, IsNotEmpty, IsNumber, Min, Max, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

/**
 * Custom validator: Proverava da li je endHour > startHour
 */
@ValidatorConstraint({ name: 'IsEndHourGreaterThanStart', async: false })
export class IsEndHourGreaterThanStartConstraint implements ValidatorConstraintInterface {
    validate(endHour: number, args: ValidationArguments) {
        const object = args.object as CreateAppointmentDto;
        return endHour > object.startHour;
    }

    defaultMessage(args: ValidationArguments) {
        const object = args.object as CreateAppointmentDto;
        return `endHour (${args.value}) mora biti veći od startHour (${object.startHour})`;
    }
}

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID of the employee', example: '507f1f77bcf86cd799439011' })
  @IsMongoId({ message: 'employee mora biti validan MongoDB ObjectId' })
  @IsNotEmpty({ message: 'employee je obavezan' })
      employee: string;

  @ApiProperty({ description: 'ID of the client', example: '507f1f77bcf86cd799439012' })
  @IsMongoId({ message: 'client mora biti validan MongoDB ObjectId' })
  @IsNotEmpty({ message: 'client je obavezan' })
      client: string;

  @ApiProperty({ description: 'ID of the tenant', example: '507f1f77bcf86cd799439013' })
  @IsMongoId({ message: 'tenant mora biti validan MongoDB ObjectId' })
  @IsNotEmpty({ message: 'tenant je obavezan' })
      tenant: string;

  @ApiProperty({ description: 'ID of the facility', example: '507f1f77bcf86cd799439014' })
  @IsMongoId({ message: 'facility mora biti validan MongoDB ObjectId' })
  @IsNotEmpty({ message: 'facility je obavezan' })
      facility: string;

  @ApiProperty({ description: 'ID of the service', example: '507f1f77bcf86cd799439015' })
  @IsMongoId({ message: 'service mora biti validan MongoDB ObjectId' })
  @IsNotEmpty({ message: 'service je obavezan' })
      service: string;

  @ApiProperty({ description: 'Appointment date (ISO string)', example: '2025-10-29' })
  @IsDateString({}, { message: 'date mora biti validan ISO datum (npr. 2025-10-29)' })
  @IsNotEmpty({ message: 'date je obavezan' })
      date: string;

  @ApiProperty({ description: 'Appointment start time in hours (0-24)', example: 9.0, minimum: 0, maximum: 24 })
  @IsNumber({}, { message: 'startHour mora biti broj' })
  @Min(0, { message: 'startHour mora biti >= 0' })
  @Max(24, { message: 'startHour mora biti <= 24' })
  @IsNotEmpty({ message: 'startHour je obavezan' })
      startHour: number;

  @ApiProperty({ description: 'Appointment end time in hours (0-24)', example: 10.5, minimum: 0, maximum: 24 })
  @IsNumber({}, { message: 'endHour mora biti broj' })
  @Min(0, { message: 'endHour mora biti >= 0' })
  @Max(24, { message: 'endHour mora biti <= 24' })
  @Validate(IsEndHourGreaterThanStartConstraint)
  @IsNotEmpty({ message: 'endHour je obavezan' })
      endHour: number;
}
