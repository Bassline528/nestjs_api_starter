import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, MaxLength, MinLength } from "class-validator";
import { lowerCaseTransformer } from "src/utils/transformers/lower-case.transformer";

export default class AuthDto {

    @ApiProperty({example: 'user123'})
    @IsString()
    @Transform(lowerCaseTransformer)
    username: string;

    @ApiProperty({example: 'hola123'})
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    password: string;
}

