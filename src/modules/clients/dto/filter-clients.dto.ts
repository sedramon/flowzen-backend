import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDateString,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class FilterClientsDto {
  @ApiProperty({description: 'Tenant ID'})
  @IsOptional()
  @IsString()
      tenant?: string;

  @ApiProperty({description: 'Search query'})
  @IsOptional()
  @IsString()
      search?: string;

  @ApiProperty({description: 'Created from date (ISO string)'})
  @IsOptional()
  @IsDateString()
      createdFrom?: string;

  @ApiProperty({description: 'Created to date (ISO string)'})
  @IsOptional()
  @IsDateString()
      createdTo?: string;

  @ApiProperty({description: 'Sort by field'})
  @IsOptional()
  @IsString()
      sortBy?: string;

  @ApiProperty({description: 'Sort direction'})
  @IsOptional()
  @IsIn(['asc', 'desc'])
      sortDir: 'asc' | 'desc' = 'asc';

  @ApiProperty({description: 'Page number'})
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
      page = 1;

  @ApiProperty({description: 'Items per page'})
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
      limit = 10;
}
