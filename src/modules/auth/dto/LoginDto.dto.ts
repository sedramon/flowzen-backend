import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, isEmail, IsString, isString } from "class-validator";

export class LoginDto {
    @ApiProperty({description: 'User email'})
    @IsEmail()
        email: string;

    @ApiProperty({description: 'User password'})
    @IsString()
        password: string;
}