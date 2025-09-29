import { IsMongoId, IsOptional, IsArray, ValidateNested, IsObject, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class SaleItemDto {
  @IsString()
  refId: string;

  @IsString()
  type: 'service' | 'product';

  @IsString()
  name: string;

  @IsNumber()
  qty: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  discount: number;

  @IsNumber()
  taxRate: number;

  @IsNumber()
  total: number;
}

class SaleSummaryDto {
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

class PaymentDto {
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

export class CreateSaleDto {
  @IsMongoId()
  facility: string;

  @IsOptional()
  @IsMongoId()
  appointment?: string;

  @IsOptional()
  @IsMongoId()
  client?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsOptional()
  @IsObject()
  @Type(() => SaleSummaryDto)
  summary?: SaleSummaryDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDto)
  payments: PaymentDto[];
}
