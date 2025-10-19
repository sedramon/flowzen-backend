import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty } from "class-validator";

export class UpdateTenantLicenseDto{
    @ApiProperty({ description: 'Tenant has active license' })
    @IsBoolean()
    @IsNotEmpty()
        hasActiveLicense: boolean;

    @ApiProperty({ description: 'Tenant license start date' })
    @IsDate()
    @IsNotEmpty()
    @Type(() => Date) // Converts incoming string to Date
        licenseStartDate: Date;

    @ApiProperty({ description: 'Tenant license expiry date' })
    @IsDate()
    @IsNotEmpty()
    @Type(() => Date) // Converts incoming string to Date
        licenseExpiryDate: Date;
}