import { IsString, IsArray, IsNotEmpty, ArrayNotEmpty, ArrayUnique } from 'class-validator'
import { IsNotBlank, StringArrayNotBlank } from '../../helpers/validatorExtensions'

export class Book {
    public id?: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsNotEmpty({ each: true })
    @IsString({ each: true })
    @StringArrayNotBlank({ message: "Author fields cannot be blank"})
    @ArrayUnique()
    public authors!: string[];

    @IsString()
    @IsNotEmpty()
    @IsNotBlank({ message: "Title fields cannot be blank"})
    public title!: string;
}