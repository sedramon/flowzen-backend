import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class UpdateSupplierDto {
    @ApiProperty({description: 'Supplier name'})
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({description: 'Supplier address'})
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty({description: 'Supplier contact phone'})
    @IsNotEmpty()
    @IsString()
    contactPhone: string;

    @ApiProperty({description: 'Supplier contact email'})
    @IsNotEmpty()
    @IsString()
    contactEmail: string;

    @ApiProperty({description: 'Tenant ID'})
    @IsNotEmpty()
    @IsMongoId()
    tenant: string
}