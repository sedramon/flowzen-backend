import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from "class-validator";

export class UpdateRoleDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsString()
    tenant: string

    @IsArray()
    @ArrayNotEmpty()
    availableScopes: string[];
}