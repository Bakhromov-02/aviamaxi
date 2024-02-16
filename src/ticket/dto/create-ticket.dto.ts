import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

import { CreateClientDto } from "../../client/dto";
import { TicketTypeEnum } from "../../common/enums";

export class CreateTicketDto {
    @ApiProperty({
        example: TicketTypeEnum.PLANE
    })
    @IsEnum(TicketTypeEnum)
    type: TicketTypeEnum;

    @IsBoolean()
    status: boolean;

    @IsNumber()
    price: number;

    @IsNumber()
    profit: number;

    // TODO date
    @IsString()
    date: string;

    @IsString()
    @IsNotEmpty()
    number: string;

    @IsString()
    @IsNotEmpty()
    flightNumber: string;

    @IsString()
    @IsNotEmpty()
    from: string;

    @IsString()
    @IsNotEmpty()
    to: string;

    @IsString()
    @IsOptional()
    comment?: string;

    @ValidateNested()
    @Type(() => CreateClientDto)
    // TODO validate client
    client?: CreateClientDto;

    @IsNumber()
    @IsOptional()
    @Min(1)
    clientId?: number;

    @IsNumber()
    @Min(1)
    agency: number;

    @IsNumber()
    @Min(1)
    order: number;
}
