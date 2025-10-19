import { IsString, IsNumber, IsOptional, Min, IsEnum } from 'class-validator';

/**
 * Data Transfer Object for cash counting
 */
export class CashCountingDto {
  /**
   * Total counted cash amount
   * @example 1500
   */
  @IsNumber({}, { message: 'Counted cash must be a number' })
  @Min(0, { message: 'Counted cash cannot be negative' })
      countedCash: number;

  /**
   * Optional note about the counting
   */
  @IsOptional()
  @IsString({ message: 'Note must be a string' })
      note?: string;

  /**
   * Cash in drawer (optional breakdown)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Cash in drawer must be a number' })
  @Min(0, { message: 'Cash in drawer cannot be negative' })
      cashInDrawer?: number;

  /**
   * Cash in register (optional breakdown)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Cash in register must be a number' })
  @Min(0, { message: 'Cash in register cannot be negative' })
      cashInRegister?: number;
}

/**
 * Data Transfer Object for cash verification
 */
export class CashVerificationDto {
  /**
   * Actual cash amount after verification
   * @example 1500
   */
  @IsNumber({}, { message: 'Actual cash must be a number' })
  @Min(0, { message: 'Actual cash cannot be negative' })
      actualCash: number;

  /**
   * Optional note about the verification
   */
  @IsOptional()
  @IsString({ message: 'Note must be a string' })
      note?: string;
}

/**
 * Variance action type
 */
export enum VarianceAction {
  ACCEPT = 'accept',
  INVESTIGATE = 'investigate',
  ADJUST = 'adjust'
}

/**
 * Data Transfer Object for handling cash variance
 */
export class CashVarianceDto {
  /**
   * Actual cash amount
   * @example 1450
   */
  @IsNumber({}, { message: 'Actual cash must be a number' })
      actualCash: number;

  /**
   * Action to take for the variance
   * @example "accept"
   */
  @IsEnum(VarianceAction, { message: 'Action must be one of: accept, investigate, adjust' })
      action: VarianceAction;

  /**
   * Reason for the variance
   * @example "Cash register error"
   */
  @IsString({ message: 'Reason must be a string' })
      reason: string;

  /**
   * Optional additional note
   */
  @IsOptional()
  @IsString({ message: 'Note must be a string' })
      note?: string;
}
