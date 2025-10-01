import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CloseSessionDto {
  @IsNumber()
  @Min(0)
  closingCount: number;

  @IsOptional()
  @IsString()
  note?: string;
}