import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateServiceDto {
      @ApiProperty({ description: 'Service name' })
      @IsString()
      @IsNotEmpty()
          name: string;

      @ApiProperty({ description: 'Service price' })
      @IsNumber()
      @IsNotEmpty()
          price: number;

      @ApiProperty({ description: 'Service duration in minutes' })
      @IsNumber()
      @IsNotEmpty()
          durationMinutes: number;

      @ApiProperty({ description: 'Service active status' })
      @IsNotEmpty()
      @IsBoolean()
          isActive: boolean;

      @ApiProperty({ description: 'Service discount price' })
      @IsNumber()
      @IsOptional()
          discountPrice?: number;

      @ApiProperty({ description: 'Service description' })
      @IsString()
      @IsOptional()
          description?: string;

      @ApiProperty({ description: 'Tenant ID' })
      @IsString()
      @IsNotEmpty()
          tenant: string;
}