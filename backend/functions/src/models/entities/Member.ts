import { IsNotBlank } from '../../helpers/validatorExtensions'
import { IsString, IsNotEmpty } from 'class-validator'

export class Member {
    public id?: string;

    @IsString()
    @IsNotEmpty()
    @IsNotBlank()
    public firstName!: string;

    @IsString()
    @IsNotEmpty()
    @IsNotBlank()
    public lastName!: string;
}