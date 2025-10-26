import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateClientDto {
    @ApiProperty({ description: 'Client first name', required: false })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiProperty({ description: 'Client last name', required: false })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiProperty({ description: 'Client contact phone', required: false })
    @IsString()
    @IsOptional()
    contactPhone?: string;

    @ApiProperty({ description: 'Client contact email', required: false })
    @IsString()
    @IsOptional()
    contactEmail?: string;

    @ApiProperty({ description: 'Client address', required: false })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ description: 'Tenant ID', required: false })
    @IsString()
    @IsOptional()
    tenant?: string;

    @ApiProperty({ description: 'User ID', required: false })
    @IsOptional()
    @IsString()
    user?: string;
}

