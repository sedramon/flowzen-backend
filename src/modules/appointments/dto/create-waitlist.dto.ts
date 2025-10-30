import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsMongoId, IsNotEmpty, IsNumber, Min, Max, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

/**
 * Custom validator: Proverava da li je endHour > startHour
 */
@ValidatorConstraint({ name: 'IsEndHourGreaterThanStart', async: false })
export class IsEndHourGreaterThanStartConstraint implements ValidatorConstraintInterface {
    validate(endHour: number, args: ValidationArguments) {
        const object = args.object as CreateWaitlistDto;
        return endHour > object.preferredStartHour;
    }

    defaultMessage(args: ValidationArguments) {
        const object = args.object as CreateWaitlistDto;
        return `preferredEndHour (${args.value}) mora biti veći od preferredStartHour (${object.preferredStartHour})`;
    }
}

export class CreateWaitlistDto {
  @ApiProperty({ description: 'ID of the client', example: '507f1f77bcf86cd799439011' })
  @IsMongoId({ message: 'client mora biti validan MongoDB ObjectId' })
  @IsNotEmpty({ message: 'client je obavezan' })
      client: string;

  @ApiProperty({ description: 'ID of the employee', example: '507f1f77bcf86cd799439012' })
  @IsMongoId({ message: 'employee mora biti validan MongoDB ObjectId' })
  @IsNotEmpty({ message: 'employee je obavezan' })
      employee: string;

  @ApiProperty({ description: 'ID of the service', example: '507f1f77bcf86cd799439013' })
  @IsMongoId({ message: 'service mora biti validan MongoDB ObjectId' })
  @IsNotEmpty({ message: 'service je obavezan' })
      service: string;

  @ApiProperty({ description: 'ID of the tenant', example: '507f1f77bcf86cd799439014' })
  @IsMongoId({ message: 'tenant mora biti validan MongoDB ObjectId' })
  @IsNotEmpty({ message: 'tenant je obavezan' })
      tenant: string;

  @ApiProperty({ description: 'ID of the facility', example: '507f1f77bcf86cd799439015' })
  @IsMongoId({ message: 'facility mora biti validan MongoDB ObjectId' })
  @IsNotEmpty({ message: 'facility je obavezan' })
      facility: string;

  @ApiProperty({ description: 'Preferred appointment date (ISO string)', example: '2025-10-29' })
  @IsDateString({}, { message: 'preferredDate mora biti validan ISO datum (npr. 2025-10-29)' })
  @IsNotEmpty({ message: 'preferredDate je obavezan' })
      preferredDate: string;

  @ApiProperty({ description: 'Preferred start time in hours (0-24)', example: 9.0, minimum: 0, maximum: 24 })
  @IsNumber({}, { message: 'preferredStartHour mora biti broj' })
  @Min(0, { message: 'preferredStartHour mora biti >= 0' })
  @Max(24, { message: 'preferredStartHour mora biti <= 24' })
  @IsNotEmpty({ message: 'preferredStartHour je obavezan' })
      preferredStartHour: number;

  @ApiProperty({ description: 'Preferred end time in hours (0-24)', example: 10.5, minimum: 0, maximum: 24 })
  @IsNumber({}, { message: 'preferredEndHour mora biti broj' })
  @Min(0, { message: 'preferredEndHour mora biti >= 0' })
  @Max(24, { message: 'preferredEndHour mora biti <= 24' })
  @Validate(IsEndHourGreaterThanStartConstraint)
  @IsNotEmpty({ message: 'preferredEndHour je obavezan' })
      preferredEndHour: number;
}
