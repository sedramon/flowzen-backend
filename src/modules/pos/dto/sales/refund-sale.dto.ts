import { IsArray, IsNumber, IsOptional, IsString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class RefundItemDto {
  @IsString()
      refId: string;
  @IsNumber()
      qty: number;
  @IsNumber()
      amount: number;
}

class RefundSummaryDto {
  @IsNumber()
      subtotal: number;
  @IsNumber()
      discountTotal: number;
  @IsNumber()
      taxTotal: number;
  @IsNumber()
      tip: number;
  @IsNumber()
      grandTotal: number;
}

class RefundPaymentDto {
  @IsString()
      method: 'cash' | 'card' | 'voucher' | 'gift' | 'bank' | 'other';
  @IsNumber()
      amount: number;
  @IsOptional()
  @IsNumber()
      change?: number;
  @IsOptional()
  @IsString()
      externalRef?: string;
}

export class RefundSaleDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RefundItemDto)
      items?: RefundItemDto[];

  @IsOptional()
  @IsNumber()
      amount?: number;

  @IsOptional()
  @IsString()
      reason?: string;

  @IsOptional()
  @IsObject()
  @Type(() => RefundSummaryDto)
      summary?: RefundSummaryDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RefundPaymentDto)
      payments?: RefundPaymentDto[];
}
