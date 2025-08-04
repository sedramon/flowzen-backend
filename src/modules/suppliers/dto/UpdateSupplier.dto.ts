import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { CreateSupplierDto } from "./CreateSupplier.dto";

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {

}