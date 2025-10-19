import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

/**
 * Data Transfer Object for closing a cash session
 */
export class CloseSessionDto {
  /**
   * Actual cash count at closing
   * @example 1500
   */
  @IsNumber({}, { message: 'Closing count must be a number' })
  @Min(0, { message: 'Closing count cannot be negative' })
      closingCount: number;

  /**
   * Optional note about the session closure
   * @example "End of shift"
   */
  @IsOptional()
  @IsString({ message: 'Note must be a string' })
      note?: string;
}