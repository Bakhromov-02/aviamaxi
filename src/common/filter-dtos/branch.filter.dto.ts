import { Transform } from "class-transformer";
import { IsOptional, IsString, MinLength } from "class-validator";

import { Pagination } from "./pagination.dto";
import { IsBooleanTransformer } from "../functions";

export class BranchFilter extends Pagination {
    @Transform(({ value }) => IsBooleanTransformer(value))
    isActive?: boolean;

    @IsString()
    @IsOptional()
    @MinLength(3)
    name?: string;
}



