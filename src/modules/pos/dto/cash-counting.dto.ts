import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

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

export class CashVerificationDto {
  @IsNumber()
  @Min(0)
  actualCash: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CashVarianceDto {
  @IsNumber()
  actualCash: number;

  @IsString()
  action: 'accept' | 'investigate' | 'adjust';

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  note?: string;
}
