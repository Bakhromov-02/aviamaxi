import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentToAgency } from './entities/payment-to-agency.entity';
import { PaymentToAgencyService } from './payment-to-agency.service';
import { PaymentToAgencyController } from './payment-to-agency.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentToAgency])
  ],
  controllers: [PaymentToAgencyController],
  providers: [PaymentToAgencyService]
})
export class PaymentToAgencyModule { }
