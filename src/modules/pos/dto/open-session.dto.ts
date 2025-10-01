import { IsString, IsNumber, IsOptional, Min, IsMongoId } from 'class-validator';

export class OpenSessionDto {
  @IsMongoId()
  facility: string;

  @IsNumber()
  @Min(0)
  openingFloat: number;

  @IsOptional()
  @IsString()
  note?: string;
}