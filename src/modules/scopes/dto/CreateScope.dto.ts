import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateScopeDto{
    @ApiProperty({description: 'Scope name'})
    @IsString()
    @IsNotEmpty()
        name: string;

    @ApiProperty({description: 'Scope description'})
    @IsString()
    @IsNotEmpty()
        description: string;
}