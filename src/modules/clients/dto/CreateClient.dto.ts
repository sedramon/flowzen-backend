import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateClientDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    contactPhone: string;

    @IsString()
    @IsOptional()
    contactEmail: string;

    @IsString()
    @IsOptional()
    address: string;

    @IsNotEmpty()
    @IsString()
    tenant: string;
}