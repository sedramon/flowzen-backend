import { IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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
