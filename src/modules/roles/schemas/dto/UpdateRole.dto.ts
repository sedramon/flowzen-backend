import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from "class-validator";

export class UpdateRoleDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @ArrayNotEmpty()
    availableScopes: string[];
}