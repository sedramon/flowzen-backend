import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsEnum, IsArray, IsBoolean } from "class-validator";

export class UpdateAgentDto {
    @ApiProperty({ description: 'Agent name', required: false })
    @IsString()
    @IsOptional()
        name?: string;

    @ApiProperty({ description: 'Unique slug for the agent', required: false })
    @IsString()
    @IsOptional()
        slug?: string;

    @ApiProperty({ description: 'Agent description', required: false })
    @IsString()
    @IsOptional()
        description?: string;

    @ApiProperty({ description: 'URL to minion image', required: false })
    @IsString()
    @IsOptional()
        minionImage?: string;

    @ApiProperty({ description: 'Voiceflow embed code (HTML)', required: false })
    @IsString()
    @IsOptional()
        embedCode?: string;

    @ApiProperty({ description: 'Tags array', type: [String], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
        tags?: string[];

    @ApiProperty({ description: 'Is agent active', required: false })
    @IsBoolean()
    @IsOptional()
        isActive?: boolean;

    @ApiProperty({ description: 'Workspace ID', required: false })
    @IsString()
    @IsOptional()
        workspaceId?: string;

    @ApiProperty({ description: 'Agent type', enum: ['internal', 'client'], required: false })
    @IsEnum(['internal', 'client'])
    @IsOptional()
        agentType?: 'internal' | 'client';

    @ApiProperty({ description: 'Client ID (if agentType is client)', required: false })
    @IsString()
    @IsOptional()
        clientId?: string;

    @ApiProperty({ description: 'Accent color (hex)', required: false })
    @IsString()
    @IsOptional()
        accentColor?: string;

    @ApiProperty({ description: 'Secondary accent color (hex)', required: false })
    @IsString()
    @IsOptional()
        secondaryAccentColor?: string;
}

