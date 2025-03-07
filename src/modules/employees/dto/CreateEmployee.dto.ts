import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsString } from "class-validator";

export class CreateEmployeeDto {
        @IsNotEmpty()
        @IsString()
        firstName: string;
    
        @IsNotEmpty()
        @IsString()
        lastName: string;
    
        @IsNotEmpty()
        @IsString()
        contactEmail: string;
    
        @IsNotEmpty()
        @IsString()
        contactPhone: string;
    
        @IsNotEmpty()
        @IsDate()
        @Type(() => Date)
        dateOfBirth: Date;
    
        @IsNotEmpty()
        @IsString()
        jobRole: string;
    
        @IsNotEmpty()
        @IsBoolean()
        isActive: boolean;
    
        @IsNotEmpty()
        @IsBoolean()
        includeInAppoitments: boolean;

        @IsString()
        @IsNotEmpty()
        tenant: string
}