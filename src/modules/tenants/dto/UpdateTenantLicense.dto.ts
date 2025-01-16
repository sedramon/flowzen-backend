import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty } from "class-validator";

export class UpdateTenantLicenseDto{
    @IsBoolean()
    @IsNotEmpty()
    hasActiveLicense: boolean;

    @IsDate()
    @IsNotEmpty()
    @Type(() => Date) // Converts incoming string to Date
    licenseStartDate: Date;

    @IsDate()
    @IsNotEmpty()
    @Type(() => Date) // Converts incoming string to Date
    licenseExpiryDate: Date;
}