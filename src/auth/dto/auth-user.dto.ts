import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class AuthUserDto {
    @IsPhoneNumber()
    @ApiProperty({
        example: '+998991234567'
    })
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'superadmin'
    })
    password: string;
}
