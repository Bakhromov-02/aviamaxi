import { Transform } from "class-transformer";
import { IsBooleanTransformer } from "../functions";

export class IsActiveDto {
  @Transform(({ value }) => IsBooleanTransformer(value))
  isActive: boolean;
}