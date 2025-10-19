import { IsOptional, IsString, IsNumber, IsBoolean, IsObject, IsMongoId } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsMongoId()
      facility?: string;

  @IsOptional()
  @IsObject()
      paymentMethods?: Record<string, any>;

  @IsOptional()
  @IsNumber()
      defaultTaxRate?: number;

  @IsOptional()
  @IsNumber()
      maxDiscountPercent?: number;

  @IsOptional()
  @IsBoolean()
      allowNegativePrice?: boolean;

  @IsOptional()
  @IsString()
      receiptNumberFormat?: string;

  @IsOptional()
  @IsObject()
      fiscalization?: Record<string, any>;

  @IsOptional()
  @IsObject()
      receiptTemplate?: Record<string, any>;

  @IsOptional()
  @IsMongoId()
      tenant?: string;
}
