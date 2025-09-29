import { PartialType } from '@nestjs/mapped-types';
import { PosSettings } from '../schemas/pos-settings.schema';

export class UpdateSettingsDto extends PartialType(PosSettings) {}
