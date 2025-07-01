import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkingShiftDto } from '../create-working-shift.dto/create-working-shift.dto';

export class UpdateWorkingShiftDto extends PartialType(CreateWorkingShiftDto) {}
