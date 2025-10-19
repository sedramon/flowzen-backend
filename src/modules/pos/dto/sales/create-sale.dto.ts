import {
    IsMongoId,
    IsOptional,
    IsArray,
    ValidateNested,
    IsObject,
    IsNumber,
    IsString,
    IsEnum,
    IsNotEmpty,
    Min,
    Max,
    ArrayMinSize,
    ValidateIf
} from 'class-validator';
import { Type } from 'class-transformer';
import {
    SaleItemType,
    PaymentMethod,
    SaleItemDetails,
    SaleSummary,
    PaymentDetails
} from '../../types';

/**
 * Sale Item DTO
 * Represents a single item in a sale transaction
 */
export class SaleItemDto implements SaleItemDetails {
  @IsString()
  @IsNotEmpty({ message: 'Item reference ID is required' })
      refId: string;

  @IsEnum(['service', 'product'], { message: 'Item type must be either "service" or "product"' })
      type: SaleItemType;

  @IsString()
  @IsNotEmpty({ message: 'Item name is required' })
      name: string;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(0.01, { message: 'Quantity must be greater than 0' })
      qty: number;

  @IsNumber({}, { message: 'Unit price must be a number' })
  @Min(0, { message: 'Unit price cannot be negative' })
      unitPrice: number;

  @IsNumber({}, { message: 'Discount must be a number' })
  @Min(0, { message: 'Discount cannot be negative' })
      discount: number;

  @IsNumber({}, { message: 'Tax rate must be a number' })
  @Min(0, { message: 'Tax rate cannot be negative' })
  @Max(100, { message: 'Tax rate cannot exceed 100%' })
      taxRate: number;

  @IsNumber({}, { message: 'Total must be a number' })
  @Min(0, { message: 'Total cannot be negative' })
      total: number;
}

/**
 * Sale Summary DTO
 * Contains calculated totals for the sale
 */
export class SaleSummaryDto implements SaleSummary {
  @IsNumber({}, { message: 'Subtotal must be a number' })
  @Min(0, { message: 'Subtotal cannot be negative' })
      subtotal: number;

  @IsNumber({}, { message: 'Discount total must be a number' })
  @Min(0, { message: 'Discount total cannot be negative' })
      discountTotal: number;

  @IsNumber({}, { message: 'Tax total must be a number' })
  @Min(0, { message: 'Tax total cannot be negative' })
      taxTotal: number;

  @IsNumber({}, { message: 'Tip must be a number' })
  @Min(0, { message: 'Tip cannot be negative' })
      tip: number;

  @IsNumber({}, { message: 'Grand total must be a number' })
  @Min(0, { message: 'Grand total cannot be negative' })
      grandTotal: number;
}

/**
 * Payment DTO
 * Represents a payment method and amount
 */
export class PaymentDto implements PaymentDetails {
  @IsEnum(['cash', 'card', 'voucher', 'gift', 'bank', 'other'], {
      message: 'Payment method must be one of: cash, card, voucher, gift, bank, other'
  })
      method: PaymentMethod;

  @IsNumber({}, { message: 'Payment amount must be a number' })
  @Min(0.01, { message: 'Payment amount must be greater than 0' })
      amount: number;

  @IsOptional()
  @IsNumber({}, { message: 'Change must be a number' })
  @Min(0, { message: 'Change cannot be negative' })
      change?: number;

  @IsOptional()
  @IsString()
      externalRef?: string;
}

/**
 * Create Sale DTO
 * Main DTO for creating a new sale transaction
 */
export class CreateSaleDto {
  @IsMongoId({ message: 'Facility ID must be a valid MongoDB ObjectId' })
  @IsNotEmpty({ message: 'Facility is required' })
      facility: string;

  @IsOptional()
  @IsMongoId({ message: 'Appointment ID must be a valid MongoDB ObjectId' })
      appointment?: string;

  @IsOptional()
  @IsMongoId({ message: 'Client ID must be a valid MongoDB ObjectId' })
      client?: string;

  @IsArray({ message: 'Items must be an array' })
  @ArrayMinSize(1, { message: 'At least one item is required' })
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
      items: SaleItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SaleSummaryDto)
      summary?: SaleSummaryDto;

  @IsArray({ message: 'Payments must be an array' })
  @ArrayMinSize(1, { message: 'At least one payment method is required' })
  @ValidateNested({ each: true })
  @Type(() => PaymentDto)
      payments: PaymentDto[];

  @IsOptional()
  @IsString()
      note?: string;

  /**
   * Custom validation to ensure payment total matches sale total
   */
  @ValidateIf((o) => o.payments && o.summary)
  get paymentTotal(): number {
      return this.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  }

  /**
   * Custom validation to ensure payment total covers sale total
   */
  @ValidateIf((o) => o.payments && o.summary)
  get isPaymentSufficient(): boolean {
      const total = this.summary?.grandTotal || 0;
      const paymentTotal = this.paymentTotal;
      return paymentTotal >= total;
  }
}
