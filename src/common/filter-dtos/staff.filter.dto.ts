import { IsOptional, IsString, MinLength } from "class-validator";
import { Pagination } from "./pagination.dto";
import { Transform } from "class-transformer";
import { IsBooleanTransformer } from "../functions";

export class StaffFilter extends Pagination {
    @IsString()
    @MinLength(3)
    @IsOptional()
    name?: string;

    @Transform(({ value }) => IsBooleanTransformer(value))
    isActive?: boolean;
}