import { IsNumber, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";

import { Pagination } from "./pagination.dto";

export class TicketFilter extends Pagination {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    branch?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    agency?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    staff?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    client?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    id?: number;
}