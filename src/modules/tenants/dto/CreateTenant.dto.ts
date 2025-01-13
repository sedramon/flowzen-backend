import { IsNotEmpty, IsString } from "class-validator";

export class CreateTenantDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    companyType: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    contactEmail: string;

    @IsString()
    contactPhone: string;

    @IsString()
    @IsNotEmpty()
    MIB: string;

    @IsString()
    @IsNotEmpty()
    PIB: string;
}