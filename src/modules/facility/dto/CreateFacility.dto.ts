import { IsNotEmpty, IsString } from "class-validator";

export class CreateFacilityDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    openingHour: string;

    @IsString()
    @IsNotEmpty()
    closingHour: string;
    
    @IsString()
    @IsNotEmpty()
    tenant: string
}