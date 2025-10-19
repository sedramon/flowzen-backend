import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateUserDtoNameAndRole {
    @ApiProperty({ description: 'User name' })
    @IsString()
    @IsNotEmpty()
        name: string;

    @ApiProperty({ description: 'User role' })
    @IsString()
    @IsNotEmpty()
        role: string;

    @ApiProperty({ description: 'Tenant ID' })
    @IsNotEmpty()
    @IsString()
        tenant: string
}