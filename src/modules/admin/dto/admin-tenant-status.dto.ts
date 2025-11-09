import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminTenantSuspendDto {
    @ApiPropertyOptional({ description: 'Reason for suspending the tenant' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
        reason?: string;
}

export class AdminTenantActivateDto {
    @ApiPropertyOptional({
        description: 'Optional note describing the activation context',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
        note?: string;
}

