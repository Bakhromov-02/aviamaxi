import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import { AppService } from './app.service';
import { StaffModule } from './staff/staff.module';
import { RoleModule } from './role/role.module';
import { BranchModule } from './branch/branch.module';
import { ClientModule } from './client/client.module';
import { AgencyModule } from './agency/agency.module';
import { PaymentToAgencyModule } from './payment-to-agency/payment-to-agency.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards';
import { OrderModule } from './order/order.module';
import { TicketModule } from './ticket/ticket.module';
import { CardModule } from './card/card.module';
import { PaymentModule } from './payment/payment.module';

const ENV = process.env.NODE_ENV.trim();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? './config/.env' : `./config/${ENV}.env`,
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: config.get<'aurora-postgres'>('TYPEORM_CONNECTION'),
        username: config.get<string>('POSTGRES_USER'),
        password: config.get<string>('POSTGRES_PASSWORD'),
        database: config.get<string>('POSTGRES_DB'),
        port: config.get<number>('POSTGRES_PORT'),
        entities: [__dirname + 'dist/**/*.entity{.ts,.js}'],
        synchronize: true, // use migration istead
        autoLoadEntities: true,
        logging: true
      }),
    }),
    {
      ...JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (config: ConfigService) => ({
          secret: config.get<string>('PRIVATE_KEY'),
          signOptions: {
            expiresIn: '24h'
          }
        })
      }),
      global: true
    },
    StaffModule,
    RoleModule,
    BranchModule,
    ClientModule,
    AgencyModule,
    PaymentToAgencyModule,
    AuthModule,
    OrderModule,
    TicketModule,
    CardModule,
    PaymentModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    AppService
  ],
})
export class AppModule { }
