import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, Validate } from 'class-validator';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';


export class CreateUserDto {

    @ApiProperty({ example: 'test1@example.com' })
    @Transform(lowerCaseTransformer)
    @IsString()

    @IsEmail()
    email: string;

    @ApiProperty({ example: 'user123'})
    @IsNotEmpty()
    @IsString()
  
    @Transform(lowerCaseTransformer)
    username: string;
    

    
    @ApiProperty()
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

    @ApiProperty({example: 'John'})
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({example: 'Kowalski'})
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({example: 'refreshToken'})
    @IsString()
    @IsOptional()
    refreshToken: string;

}