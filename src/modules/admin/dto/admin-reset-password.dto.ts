import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class AdminResetPasswordDto {
    @ApiProperty({ description: 'New plain-text password' })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
        password: string;
}

