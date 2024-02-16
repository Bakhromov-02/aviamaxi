import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsPassportNumber, IsPhoneNumber, IsString } from "class-validator";

import { CountryEnum, DocumentTypeEnum, GenderEnum } from "../../common/enums";

export class CreateClientDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEnum(GenderEnum)
    gender: GenderEnum;

    @ApiProperty({
        example: CountryEnum.Uzbekistan
    })
    @IsEnum(CountryEnum)
    citizenship: CountryEnum;

    @IsPhoneNumber()
    phoneNumber: string;

    // TODO ask date picker response type
    // @IsDate()
    @IsString()
    birthDate: string;

    @IsEnum(DocumentTypeEnum)
    documentType: DocumentTypeEnum;

    @IsString()
    @IsNotEmpty()
    //TODO @IsPassportNumber(`${Object.values(CountryEnum)}`)
    document: string;

    // TODO change validation  
    @IsString()
    documentDate: string;
}
