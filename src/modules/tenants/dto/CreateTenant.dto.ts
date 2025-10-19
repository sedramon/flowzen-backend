import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTenantDto {
    @ApiProperty({ description: 'Tenant name' })
    @IsString()
    @IsNotEmpty()
        name: string;

    @ApiProperty({ description: 'Tenant company type' })
    @IsString()
    @IsNotEmpty()
        companyType: string;

    @ApiProperty({ description: 'Tenant address' })
    @IsString()
    @IsNotEmpty()
        street: string;

    @ApiProperty({ description: 'Tenant city' })
    @IsString()
    @IsNotEmpty()
        city: string;

    @ApiProperty({ description: 'Tenant country' })
    @IsString()
    @IsNotEmpty()
        country: string;

    @ApiProperty({ description: 'Tenant contact email' })
    @IsString()
    @IsNotEmpty()
        contactEmail: string;

    @ApiProperty({ description: 'Tenant contact phone' })
    @IsString()
    @IsNotEmpty()
        contactPhone: string;

    @ApiProperty({ description: 'Tenant MIB' })
    @IsString()
    @IsNotEmpty()
        MIB: string;

    @ApiProperty({ description: 'Tenant PIB' })
    @IsString()
    @IsNotEmpty()
        PIB: string;
}