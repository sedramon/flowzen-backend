import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreateSupplierDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    contactPhone: string;

    @IsNotEmpty()
    @IsString()
    contactEmail: string;

    @IsNotEmpty()
    @IsMongoId()
    tenant: string
}