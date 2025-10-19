import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateArticleDto {
    @ApiProperty({ description: 'Article name' })
    @IsNotEmpty()
    @IsString()
        name: string;

    @ApiProperty({ description: 'Article unit of measure' })
    @IsNotEmpty()
    @IsString()
        unitOfMeasure: string;

    @ApiProperty({ description: 'Article price' })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
        price: number;

    @ApiProperty({ description: 'Article sale price', nullable: true, required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
        salePrice?: number;

    @ApiProperty({ description: 'Article sale price is ative', required: false })
    @IsOptional()
    @IsBoolean()
        isOnSale?: boolean;

    @ApiProperty({ description: 'Article code', required: false, example: '' })
    @IsOptional()
    @IsString()
        code?: string;

    @ApiProperty({ description: 'Article tax rate', required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
        taxRates?: number;

    @ApiProperty({ description: 'Article Supplier', required: false, nullable: true, example: null })
    @IsMongoId()
    @IsOptional()
        supplier?: string | null;

    @ApiProperty({description: 'Article Tenant'})
    @IsNotEmpty()
    @IsMongoId()
        tenant: string;

    @ApiProperty({ description: 'Article activity', required: false })
    @IsBoolean()
    @IsOptional()
        isActive?: boolean;

    @ApiProperty({ description: 'Article remark', required: false, example: '' })
    @IsString()
    @IsOptional()
        remark?: string;


}