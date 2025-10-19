// dto/upsert-settings.dto.ts
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { SettingType, Theme } from "../schemas/settings.schema";

export class UpsertSettingsDto {
  @ApiProperty({ description: "Tenant Id" })
  @IsNotEmpty()
  @IsMongoId()
      tenant: string;

  @ApiProperty({ description: "Scope of the settings", enum: ["tenant", "user"] })
  @IsNotEmpty()
  @IsEnum(["tenant", "user"])
      type: SettingType;

  @ApiPropertyOptional({ description: "User Id (required when type='user')", nullable: true })
  @IsOptional()
  @IsMongoId()
      user?: string | null;

  @ApiPropertyOptional({ description: "UI language, e.g. 'en', 'de', 'es'" })
  @IsOptional()
  @IsString()
      language?: string;

  @ApiPropertyOptional({ description: "Currency code, e.g. 'RSD', 'EUR', 'USD'" })
  @IsOptional()
  @IsString()
      currency?: string;

  @ApiPropertyOptional({ description: "Theme", enum: ["light", "dark", "system"] })
  @IsOptional()
  @IsEnum(["light", "dark", "system"])
      theme?: Theme;

  @ApiPropertyOptional({ description: "Navbar shortcuts", type: [String] })
  @IsOptional()
  @IsArray()
      navbarShortcuts?: string[];

  @ApiPropertyOptional({ description: "Default landing page route, e.g. '/' or '/dashboard'" })
  @IsOptional()
  @IsString()
      landingPage?: string;
}