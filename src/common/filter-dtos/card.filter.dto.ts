import { IsOptional, IsString, MinLength } from "class-validator";

import { Pagination } from "./pagination.dto";

export class CardFilter extends Pagination {
    @IsString()
    @IsOptional()
    @MinLength(3)
    name?: string;
}