import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateClientDto {
    @ApiProperty({description: 'Client first name'})
    @IsString()
    @IsNotEmpty()
        firstName: string;

    @ApiProperty({description: 'Client last name'})
    @IsString()
    @IsNotEmpty()
        lastName: string;

    @ApiProperty({description: 'Client contact phone'})
    @IsString()
    @IsNotEmpty()
        contactPhone: string;

    @ApiProperty({description: 'Client contact email'})
    @IsString()
    @IsOptional()
        contactEmail: string;

    @ApiProperty({description: 'Client address'})
    @IsString()
    @IsOptional()
        address: string;

    @ApiProperty({description: 'Tenant ID'})
    @IsNotEmpty()
    @IsString()
        tenant: string;
}