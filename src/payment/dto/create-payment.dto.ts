import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { PaymentTypeEnum } from "src/common/enums";

export class CreatePaymentDto {
    @IsEnum(PaymentTypeEnum)
    type: PaymentTypeEnum;

    @IsNumber()
    amount: number;

    @IsString()
    @IsOptional()
    comment?: string;

    @IsNumber()
    card: number;
}
