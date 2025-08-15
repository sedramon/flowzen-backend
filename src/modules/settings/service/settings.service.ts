import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isValidObjectId, Model, Types } from "mongoose";
import { EffectiveSettings, RawSettingsDoc, Settings, SettingsModel } from "../schemas/settings.schema";
import { PinoLogger } from "nestjs-pino";
import { Tenant } from "src/modules/tenants/schemas/tenant.schema";
import { User } from "src/modules/users/schemas/user.schema";
import { UpsertSettingsDto } from "../dto/CreateSettings.dto";

@Injectable()
export class SettingsService implements OnModuleInit {
    constructor(
        @InjectModel(Settings.name) private readonly settingsModel: SettingsModel,
        @InjectModel(Tenant.name) private readonly tenantModel: Model<Tenant>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly logger: PinoLogger
    ) { }

    async onModuleInit() {
        await this.settingsModel.syncIndexes();
    }

    async findSettings(tenantId: string, userId: string): Promise<EffectiveSettings> {
        this.logger.debug({ tenantId, userId }, "Finding effective settings");

        if (!isValidObjectId(tenantId)) {
            this.logger.warn({ tenantId }, "Invalid tenant ID supplied to findSettings");
            throw new BadRequestException(`Invalid tenant ID: ${tenantId}`);
        }
        if (!isValidObjectId(userId)) {
            this.logger.warn({ userId }, "Invalid user ID supplied to findSettings");
            throw new BadRequestException(`Invalid user ID: ${userId}`);
        }

        const settings = await this.settingsModel.getEffective(
            new Types.ObjectId(tenantId),
            new Types.ObjectId(userId)
        );

        this.logger.debug({ settings }, "Effective settings resolved");
        return settings;
    }

    async findTenantSettingsRaw(tenantId: string): Promise<RawSettingsDoc> {
        this.logger.debug({ tenantId }, "Finding tenant raw settings");

        if (!isValidObjectId(tenantId)) {
            this.logger.warn({ tenantId }, "Invalid tenant ID supplied to findTenantSettingsRaw");
            throw new BadRequestException(`Invalid tenant ID: ${tenantId}`);
        }

        return await this.settingsModel.getTenantSettingsRaw(new Types.ObjectId(tenantId));
    }

    async findUserSettingsRaw(tenantId: string, userId: string): Promise<RawSettingsDoc> {
        this.logger.debug({ tenantId, userId }, "Finding user raw settings");

        if (!isValidObjectId(tenantId)) {
            this.logger.warn({ tenantId }, "Invalid tenant ID supplied to findUserSettingsRaw");
            throw new BadRequestException(`Invalid tenant ID: ${tenantId}`);
        }
        if (!isValidObjectId(userId)) {
            this.logger.warn({ userId }, "Invalid user ID supplied to findUserSettingsRaw");
            throw new BadRequestException(`Invalid user ID: ${userId}`);
        }

        return await this.settingsModel.getUserSettingsRaw(
            new Types.ObjectId(tenantId),
            new Types.ObjectId(userId)
        );
    }



    async upsertSettings(dto: UpsertSettingsDto): Promise<Settings> {
        this.logger.debug({ dto }, "Upserting settings");

        const { tenant, user, type } = dto;

        if (!isValidObjectId(tenant)) {
            this.logger.warn({ tenant }, "Invalid tenant ID supplied to upsert");
            throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
        }
        const tenantDocument = await this.tenantModel.findById(tenant).lean();
        if (!tenantDocument) {
            this.logger.warn({ tenant }, "Tenant not found");
            throw new NotFoundException(`Tenant with ID ${tenant} not found`);
        }

        if (type === "user") {
            if (!user) {
                throw new BadRequestException(`User ID must be provided when type is 'user'`);
            }
            if (!isValidObjectId(user)) {
                this.logger.warn({ user }, "Invalid user ID supplied to upsert");
                throw new BadRequestException(`Invalid user ID: ${user}`);
            }
            const userDocument = await this.userModel.findById(user).lean();
            if (!userDocument) {
                this.logger.warn({ user }, "User not found");
                throw new NotFoundException(`User with ID ${user} not found`);
            }
        } else if (type === "tenant" && user) {
            throw new BadRequestException(`User ID must be null/omitted when type is 'tenant'`);
        }

        const filter = {
            tenant: new Types.ObjectId(tenant),
            type,
            user: type === "user" ? new Types.ObjectId(user!) : null,
        };

        const allowedFields: (keyof Settings)[] = [
            "language",
            "currency",
            "theme",
            "navbarShortcuts",
            "landingPage",
        ];
        const $set: Partial<Settings> = {};
        for (const f of allowedFields) {
            if (dto[f] !== undefined) {
                ($set as any)[f] = dto[f];
            }
        }

        if (Object.keys($set).length === 0) {
            const existing = await this.settingsModel.findOne(filter).exec();
            if (existing) return existing;
            throw new BadRequestException("No settings fields provided to update");
        }

        const update: any = { $set };

        const options = { new: true, upsert: true, setDefaultsOnInsert: true };

        try {
            const setting = await this.settingsModel.findOneAndUpdate(filter, update, options).exec();
            this.logger.info({ id: setting._id, type, user: setting.user }, "Upserted settings");
            return setting;
        } catch (error: any) {
            if (error?.code === 11000) {
                throw new BadRequestException(
                    `A settings document for this scope (tenant=${tenant}, type=${type}, user=${user ?? "null"}) already exists and conflicted.`
                );
            }
            throw error;
        }
    }
}