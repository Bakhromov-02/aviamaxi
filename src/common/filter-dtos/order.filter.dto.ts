import { IsNumber, IsOptional, IsString, Length, Min, MinLength } from "class-validator";
import { Pagination } from "./pagination.dto";
import { Type } from "class-transformer";

export class OrderFilter extends Pagination {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    id?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    branch?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    staff?: number;

    @IsString()
    @IsOptional()
    @Length(10, 10)
    date?: string;
}