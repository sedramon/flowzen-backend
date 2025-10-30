import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './CreateClient.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {}
