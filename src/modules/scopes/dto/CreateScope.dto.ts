import { IsNotEmpty, IsString } from "class-validator";

export class CreateScopeDto{
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}