import { OmitType, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { CreateTicketDto } from './create-ticket.dto';

export class UpdateTicketDto extends PartialType(OmitType(CreateTicketDto, ['order'])) {
}
