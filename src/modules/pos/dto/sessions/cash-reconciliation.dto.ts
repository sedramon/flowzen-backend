import { IsString, IsOptional, IsNumber, Min, IsMongoId } from 'class-validator';

export class CashReconciliationDto {
  @IsMongoId()
      sessionId: string;

  @IsOptional()
  @IsString()
      note?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
      actualCash?: number;
}

export class CashCountingDto {
  @IsNumber()
  @Min(0)
      countedCash: number;

  @IsOptional()
  @IsString()
      note?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
      cashInDrawer?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
      cashInRegister?: number;
}

export class CashVarianceDto {
  @IsNumber()
      expectedCash: number;

  @IsNumber()
      actualCash: number;

  @IsNumber()
      variance: number;

  @IsOptional()
  @IsString()
      reason?: string;

  @IsOptional()
  @IsString()
      action?: 'accept' | 'investigate' | 'adjust';
}
