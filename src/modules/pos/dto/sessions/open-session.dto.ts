import { IsString, IsNumber, IsOptional, Min, IsMongoId } from 'class-validator';

/**
 * Data Transfer Object for opening a new cash session
 */
export class OpenSessionDto {
  /**
   * Facility ID where the session is being opened
   * @example "64a1b2c3d4e5f6789012345a"
   */
  @IsMongoId({ message: 'Facility must be a valid MongoDB ObjectId' })
      facility: string;

  /**
   * Opening cash float amount
   * @example 1000
   */
  @IsNumber({}, { message: 'Opening float must be a number' })
  @Min(0, { message: 'Opening float cannot be negative' })
      openingFloat: number;

  /**
   * Optional note about the session
   * @example "Morning shift"
   */
  @IsOptional()
  @IsString({ message: 'Note must be a string' })
      note?: string;
}