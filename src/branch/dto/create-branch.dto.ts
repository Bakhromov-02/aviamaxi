import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBranchDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
