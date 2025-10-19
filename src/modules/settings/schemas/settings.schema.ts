import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Schema as MongooseSchema, Model } from 'mongoose';
import { Tenant } from "src/modules/tenants/schemas/tenant.schema";
import { User } from "src/modules/users/schemas/user.schema";

export type SettingType = 'tenant' | 'user';
export type Theme = 'light' | 'dark' | 'system';

@Schema({ timestamps: true })
export class Settings {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true, index: true })
      tenant: Types.ObjectId | Tenant;

  @Prop({ type: String, enum: ['tenant', 'user'], required: true, trim: true })
      type: SettingType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
      user: Types.ObjectId | User | null;

  @Prop({ type: String, required: false }) language?: string;
  @Prop({ type: String, required: false }) currency?: string;
  @Prop({ type: String, enum: ['light', 'dark', 'system'], required: false }) theme?: Theme;
  @Prop({ type: [String], required: false }) navbarShortcuts?: string[];
  @Prop({ type: String, required: false }) landingPage?: string;
}

const SettingsSchema = SchemaFactory.createForClass(Settings);

SettingsSchema.index({ tenant: 1, type: 1, user: 1 }, { unique: true });

// ---------- helpers ----------
function withAllFields(doc?: any) {
    const base = {
        language: undefined as string | undefined,
        currency: undefined as string | undefined,
        theme: undefined as Theme | undefined,
        navbarShortcuts: undefined as string[] | undefined,
        landingPage: undefined as string | undefined,
    };
    if (!doc) return { ...base };
    const { _id, tenant, type, user, __v, createdAt, updatedAt, ...rest } = doc;
    return {
        _id,
        tenant,
        type,
        user,
        createdAt,
        updatedAt,
        ...base,
        ...rest,
    };
}

// ---------- statics ----------
SettingsSchema.statics.getTenantSettingsRaw = async function (tenantId: Types.ObjectId): Promise<RawSettingsDoc> {
    const doc = await this.findOne({ tenant: tenantId, type: 'tenant', user: null })
        .select('tenant type user createdAt updatedAt language currency theme navbarShortcuts landingPage')
        .lean();
    return doc ? withAllFields(doc) : withAllFields();
};

SettingsSchema.statics.getUserSettingsRaw = async function (tenantId: Types.ObjectId, userId: Types.ObjectId): Promise<RawSettingsDoc> {
    const doc = await this.findOne({ tenant: tenantId, type: 'user', user: userId })
        .select('tenant type user createdAt updatedAt language currency theme navbarShortcuts landingPage')
        .lean();
    return doc ? withAllFields(doc) : withAllFields();
};

SettingsSchema.statics.getEffective = async function (
    tenantId: Types.ObjectId,
    userId: Types.ObjectId
): Promise<EffectiveSettings> {
    const systemDefaults: EffectiveSettings = {
        language: 'en',
        currency: 'RSD',
        theme: 'dark',
        navbarShortcuts: [],
        landingPage: '/',
    };

    const [tenantDoc, userDoc] = await Promise.all([
        this.findOne({ tenant: tenantId, type: 'tenant', user: null })
            .select('language currency theme navbarShortcuts landingPage')
            .lean(),
        this.findOne({ tenant: tenantId, type: 'user', user: userId })
            .select('language currency theme navbarShortcuts landingPage')
            .lean(),
    ]);

    const tenantValues = withAllFields(tenantDoc);
    const userValues   = withAllFields(userDoc);

    return {
        language: userValues.language ?? tenantValues.language ?? systemDefaults.language,
        currency: userValues.currency ?? tenantValues.currency ?? systemDefaults.currency,
        theme: userValues.theme ?? tenantValues.theme ?? systemDefaults.theme,
        navbarShortcuts: userValues.navbarShortcuts ?? tenantValues.navbarShortcuts ?? systemDefaults.navbarShortcuts,
        landingPage: userValues.landingPage ?? tenantValues.landingPage ?? systemDefaults.landingPage,
    };
};

// ---------- types ----------
export interface EffectiveSettings {
  language: string;
  currency: string;
  theme: Theme;
  navbarShortcuts: string[];
  landingPage: string;
}

export interface RawSettingsDoc {
  _id?: any;
  tenant?: any;
  type?: SettingType;
  user?: any;
  createdAt?: Date;
  updatedAt?: Date;
  language?: string;
  currency?: string;
  theme?: Theme;
  navbarShortcuts?: string[];
  landingPage?: string;
}

export interface SettingsModel extends Model<Settings> {
  getTenantSettingsRaw(tenantId: Types.ObjectId): Promise<RawSettingsDoc>;
  getUserSettingsRaw(tenantId: Types.ObjectId, userId: Types.ObjectId): Promise<RawSettingsDoc>;
  getEffective(tenantId: Types.ObjectId, userId: Types.ObjectId): Promise<EffectiveSettings>;
}

export { SettingsSchema };