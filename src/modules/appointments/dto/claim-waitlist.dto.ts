import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class ClaimWaitlistDto {
    @ApiProperty({
        description: 'Token generisan u email notifikaciji',
        example: 'b6f4c2a2fe3f4a6fb7d602f4f4d98c9c',
    })
    @IsString()
    @IsNotEmpty()
    @Length(32, 256)
    claimToken!: string;

    @ApiProperty({
        description: 'Opcioni client ID za dodatnu validaciju (dashboard flow)',
        required: false,
        example: '68100214f3991ddfbc1ccc8e',
    })
    @IsOptional()
    @IsMongoId({ message: 'clientId mora biti validan MongoDB ObjectId' })
    clientId?: string;
}

