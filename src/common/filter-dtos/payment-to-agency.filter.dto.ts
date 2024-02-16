import { IsNumber, IsOptional } from "class-validator";
import { Pagination } from "./pagination.dto";

export class PaymentToAgencyFilter extends Pagination {
    @IsNumber()
    @IsOptional()
    agency?: number;
}