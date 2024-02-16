import { IsNotEmpty, IsNumber, IsString, Length, IsNumberString } from "class-validator";

export class CreateCardDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumberString()
    @Length(16, 16)
    number: string;
}
