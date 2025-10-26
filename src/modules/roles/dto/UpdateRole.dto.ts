import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class UpdateRoleDto {
    @ApiProperty({description: 'Role name'})
    @IsString()
    @IsNotEmpty()
        name: string;

    @ApiProperty({description: 'Tenant ID'})
    @IsNotEmpty()
    @IsString()
        tenant: string

    @ApiProperty({description: 'Available scopes'})
    @IsArray()
        availableScopes: string[];
}