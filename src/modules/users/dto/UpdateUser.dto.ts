import { IsNotEmpty, IsString } from "class-validator";

export class UpdateUserDtoNameAndRole {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    role: string;

    @IsNotEmpty()
    @IsString()
    tenant: string
}