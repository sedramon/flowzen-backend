import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PosSettings } from '../schemas/pos-settings.schema';
import { JwtUserPayload } from '../types';

/**
 * Settings Service
 * 
 * Handles POS settings management including facility-specific
 * configuration, fiscal settings, and system preferences.
 */
@Injectable()
export class SettingsService {
    private readonly logger = new Logger(SettingsService.name);

    constructor(
    @InjectModel(PosSettings.name) private readonly settingsModel: Model<PosSettings>,
    ) {}

    /**
   * Get POS settings for a specific facility
   * @param facility - Facility ID
   * @param user - Authenticated user
   * @returns POS settings document
   */
    async getSettings(facility: string, user: JwtUserPayload): Promise<PosSettings> {
    // Validate MongoDB ObjectId format
        if (!facility || !this.isValidObjectId(facility)) {
            throw new BadRequestException('Invalid facility ID format');
        }
    
        if (!user.tenant || !this.isValidObjectId(user.tenant)) {
            throw new BadRequestException('Invalid tenant ID format');
        }

        let settings = await this.settingsModel.findOne({ facility, tenant: user.tenant });
        if (!settings) {
            settings = await this.settingsModel.create({ facility, tenant: user.tenant });
            this.logger.log(`Created default POS settings for facility ${facility}`);
        }
        this.logger.log(`Returned POS settings for facility ${facility}`);
        return settings;
    }

    /**
   * Update POS settings for a facility
   * @param dto - Settings update data
   * @param user - Authenticated user
   * @returns Updated POS settings document
   */
    async updateSettings(dto: any, user: JwtUserPayload): Promise<PosSettings> {
    // Validate MongoDB ObjectId format
        if (dto.facility && !this.isValidObjectId(dto.facility)) {
            throw new BadRequestException('Invalid facility ID format');
        }
    
        if (dto.tenant && !this.isValidObjectId(dto.tenant)) {
            throw new BadRequestException('Invalid tenant ID format');
        }

        if (!user.tenant || !this.isValidObjectId(user.tenant)) {
            throw new BadRequestException('Invalid user tenant ID format');
        }

        let settings = await this.settingsModel.findOne({ facility: dto.facility, tenant: user.tenant });
        if (!settings) {
            settings = await this.settingsModel.create({ ...dto, tenant: user.tenant });
            this.logger.log(`Created POS settings for facility ${dto.facility}`);
        } else {
            Object.assign(settings, dto);
            await settings.save();
            this.logger.log(`Updated POS settings for facility ${dto.facility}`);
        }
        return settings;
    }

    /**
   * Validate MongoDB ObjectId format
   * @param id - ObjectId string to validate
   * @returns True if valid ObjectId format
   */
    private isValidObjectId(id: string): boolean {
        return /^[0-9a-fA-F]{24}$/.test(id);
    }
}
