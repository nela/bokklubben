import { IsNotBlank } from '../../helpers/validatorExtensions'
import { IsString, IsEmail } from 'class-validator'

export class CreateMemberDto {
    @IsString()
    @IsNotBlank()
    public firstName!: string;

    @IsString()
    @IsNotBlank()
    public lastName!: string;

    @IsString()
    @IsNotBlank()
    @IsEmail()
    public email!: string;

    @IsString()
    @IsNotBlank()
    public password!: string;

    @IsString()
    @IsNotBlank()
    public confirmPassword!: string;
}