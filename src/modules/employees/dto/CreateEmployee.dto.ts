import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsString, IsArray } from "class-validator";

export class CreateEmployeeDto {
        @ApiProperty({description: 'Employee first name'})
        @IsNotEmpty()
        @IsString()
        firstName: string;
    
        @ApiProperty({description: 'Employee last name'})
        @IsNotEmpty()
        @IsString()
        lastName: string;
    
        @ApiProperty({description: 'Employee contact email'})
        @IsNotEmpty()
        @IsString()
        contactEmail: string;
    
        @ApiProperty({description: 'Employee contact phone'})
        @IsNotEmpty()
        @IsString()
        contactPhone: string;
    
        @ApiProperty({description: 'Employee date of birth (ISO string)'})
        @IsNotEmpty()
        @IsDate()
        @Type(() => Date)
        dateOfBirth: Date;
    
        @ApiProperty({description: 'Employee job role'})
        @IsNotEmpty()
        @IsString()
        jobRole: string;
    
        @ApiProperty({description: 'Employee active status'})
        @IsNotEmpty()
        @IsBoolean()
        isActive: boolean;
    
        @ApiProperty({description: 'Employee include in appoitments'})
        @IsNotEmpty()
        @IsBoolean()
        includeInAppoitments: boolean;

        @ApiProperty({description: 'Tenant ID'})
        @IsString()
        @IsNotEmpty()
        tenant: string;

        // @IsNotEmpty()
        // @IsString()
        avatarUrl: string;

}