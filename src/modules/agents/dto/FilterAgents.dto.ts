import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsEnum, IsString, IsBoolean } from "class-validator";

export class FilterAgentsDto {
    @ApiProperty({ description: 'Filter by agent type', enum: ['internal', 'client'], required: false })
    @IsEnum(['internal', 'client'])
    @IsOptional()
        agentType?: 'internal' | 'client';

    @ApiProperty({ description: 'Filter by client ID', required: false })
    @IsString()
    @IsOptional()
        clientId?: string;

    @ApiProperty({ description: 'Filter by active status', required: false })
    @IsBoolean()
    @IsOptional()
        isActive?: boolean;
}

