import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateFacilityDto {
    @ApiProperty({description: 'Facility name'})
    @IsString()
    @IsNotEmpty()
        name: string;

    @ApiProperty({description: 'Facility address'})
    @IsString()
    @IsNotEmpty()
        address: string;

    @ApiProperty({description: 'Facility opening hour'})
    @IsString()
    @IsNotEmpty()
        openingHour: string;

    @ApiProperty({description: 'Facility closing hour'})
    @IsString()
    @IsNotEmpty()
        closingHour: string;
    
    @ApiProperty({description: 'Tenant ID'})
    @IsString()
    @IsNotEmpty()
        tenant: string
}