import { IsOptional, IsString, MinLength } from "class-validator";
import { Pagination } from "./pagination.dto";

export class ClientFilter extends Pagination {

    @IsString()
    @MinLength(3)
    @IsOptional()
    name?: string;
}



