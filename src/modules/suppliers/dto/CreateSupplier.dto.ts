import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSupplierDto {
    @ApiProperty({ description: 'Supplier name' })
    @IsNotEmpty()
    @IsString()
        name: string;

    @ApiProperty({ description: 'Supplier address' })
    @IsNotEmpty()
    @IsString()
        address: string;

    @ApiProperty({ description: 'Supplier city' })
    @IsNotEmpty()
    @IsString()
        city: string;


    @ApiProperty({ description: 'Supplier contact phone' })
    @IsNotEmpty()
    @IsString()
        contactPhone: string;

    @ApiProperty({
        description: 'Supplier contact landline',
        required: false,
        example: ''
    })
    @IsString()
    @IsOptional()
        contactLandline?: string;

    @ApiProperty({ description: 'Supplier contact email' })
    @IsNotEmpty()
    @IsString()
        contactEmail: string;

    @ApiProperty({
        description: 'Supplier contact person',
        required: false,
        example: ''
    })
    @IsString()
    @IsOptional()
        contactPerson?: string;

    @ApiProperty({
        description: 'Supplier PIB',
        required: false,
        example: ''
    })
    @IsString()
    @IsOptional()
        pib?: string;

    @ApiProperty({
        description: 'Supplier remark',
        required: false,
        example: ''
    })
    @IsString()
    @IsOptional()
        remark?: string;

    @ApiProperty({
        description: 'Supplier remark',
        required: false
    })
    @IsBoolean()
    @IsOptional()
        isActive?: boolean;

    @ApiProperty({ description: 'Tenant ID' })
    @IsNotEmpty()
    @IsMongoId()
        tenant: string
}