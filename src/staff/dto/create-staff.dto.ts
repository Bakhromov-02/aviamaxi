import { IsNotEmpty, IsPhoneNumber, IsString, IsBoolean, IsNumberString, IsNumber, IsOptional } from "class-validator";

export class CreateStaffDto {
    @IsPhoneNumber()
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsBoolean()
    @IsOptional()
    isActive: boolean;

    @IsNumber()
    role: number;

    @IsNumber()
    branch: number;
}
