import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateRoleDto {
    @ApiProperty({description: 'Role name'})
    @IsString()
    @IsNotEmpty()
        name: string;

    @ApiProperty({description: 'Available scopes'})
    @IsArray()
    @ArrayNotEmpty()
        availableScopes: string[];

    @ApiProperty({description: 'Tenant ID'})
    @IsString()
    @IsNotEmpty()
        tenant: string
}