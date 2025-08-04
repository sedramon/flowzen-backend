import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './CreateEmployee.dto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
} 