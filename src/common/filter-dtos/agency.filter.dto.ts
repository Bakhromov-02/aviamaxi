import { Transform } from "class-transformer";
import { Pagination } from "./pagination.dto";
import { IsBooleanTransformer } from "../functions";
import { IsOptional, IsString, MinLength } from "class-validator";

export class AgencyFilter extends Pagination {
    @Transform(({ value }) => IsBooleanTransformer(value))
    isActive?: boolean;

    @IsString()
    @IsOptional()
    @MinLength(3)
    name?: string;
}



