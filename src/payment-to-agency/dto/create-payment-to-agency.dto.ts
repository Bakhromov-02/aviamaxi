import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePaymentToAgencyDto {
    @IsNumber()
    agency: number;

    @IsNumber()
    amount: number;

    @IsString()
    @IsOptional()
    comment?: string;
}
