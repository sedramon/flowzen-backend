import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray, IsBoolean, IsUrl } from "class-validator";

export class CreateAgentDto {
    @ApiProperty({ description: 'Agent name' })
    @IsString()
    @IsNotEmpty()
        name: string;

    @ApiProperty({ description: 'Unique slug for the agent' })
    @IsString()
    @IsNotEmpty()
        slug: string;

    @ApiProperty({ description: 'Agent description' })
    @IsString()
    @IsNotEmpty()
        description: string;

    @ApiProperty({ description: 'URL to minion image' })
    @IsString()
    @IsNotEmpty()
        minionImage: string;

    @ApiProperty({ description: 'Voiceflow embed code (HTML)' })
    @IsString()
    @IsNotEmpty()
        embedCode: string;

    @ApiProperty({ description: 'Tags array', type: [String], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
        tags?: string[];

    @ApiProperty({ description: 'Is agent active', required: false, default: true })
    @IsBoolean()
    @IsOptional()
        isActive?: boolean;

    @ApiProperty({ description: 'Workspace ID', required: false })
    @IsString()
    @IsOptional()
        workspaceId?: string;

    @ApiProperty({ description: 'Agent type', enum: ['internal', 'client'], required: false, default: 'internal' })
    @IsEnum(['internal', 'client'])
    @IsOptional()
        agentType?: 'internal' | 'client';

    @ApiProperty({ description: 'Client ID (if agentType is client)', required: false })
    @IsString()
    @IsOptional()
        clientId?: string;

    @ApiProperty({ description: 'Accent color (hex)', required: false, default: '#00cfff' })
    @IsString()
    @IsOptional()
        accentColor?: string;

    @ApiProperty({ description: 'Secondary accent color (hex)', required: false, default: '#0099cc' })
    @IsString()
    @IsOptional()
        secondaryAccentColor?: string;
}

