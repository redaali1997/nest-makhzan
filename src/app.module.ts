import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { validateEnv } from './shared/config/env.validation';
import databaseConfig from './shared/config/database.config';
import redisConfig from './shared/config/redis.config';
import jwtConfig from './shared/config/jwt.config';
import appConfig from './shared/config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogModule } from './modules/catalog/catalog.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { buildDataSourceOptions } from './shared/database/typeorm.config';
import { PaymentModule } from './modules/payment/payment.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [databaseConfig, redisConfig, jwtConfig, appConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (db: ConfigType<typeof databaseConfig>) => ({
        ...buildDataSourceOptions(db),
        autoLoadEntities: true,
      }),
      inject: [databaseConfig.KEY],
    }),
    CatalogModule,
    InventoryModule,
    PaymentModule.forRootAsync({
      useFactory: (config: ConfigType<typeof appConfig>) => ({
        mode: config.env === 'test' ? 'failing' : 'mock',
      }),
      inject: [appConfig.KEY],
    }),
    OrdersModule,
  ],
})
export class AppModule {}
