
import { PartialType } from '@nestjs/swagger';
import { CreatePaymentToAgencyDto } from './create-payment-to-agency.dto';

export class UpdatePaymentToAgencyDto extends PartialType(CreatePaymentToAgencyDto) {}
