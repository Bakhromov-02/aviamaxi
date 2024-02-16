import { IsNumber } from "class-validator";

export class ReturnedTicketDto {
    @IsNumber()
    returned: number;
}