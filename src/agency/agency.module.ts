import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Agency } from './entities/agency.entity';
import { AgencyService } from './agency.service';
import { AgencyController } from './agency.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agency])
  ],
  controllers: [AgencyController],
  providers: [AgencyService]
})
export class AgencyModule { }
