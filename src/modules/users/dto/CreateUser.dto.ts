import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserDto{
    @IsString()
    @IsOptional()
    name: string;

    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    role: string;

    @IsNotEmpty()
    @IsString()
    tenant: string
}