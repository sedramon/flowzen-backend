import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserDto{
    @ApiProperty({ description: 'User name' })
    @IsString()
    @IsOptional()
        name: string;

    @ApiProperty({ description: 'User email' })
    @IsNotEmpty()
    @IsString()
        email: string;

    @ApiProperty({ description: 'User password' })
    @IsNotEmpty()
    @IsString()
        password: string;

    @ApiProperty({ description: 'User role' })
    @IsNotEmpty()
    @IsString()
        role: string;

    @ApiProperty({ description: 'Tenant ID' })
    @IsNotEmpty()
    @IsString()
        tenant: string
}