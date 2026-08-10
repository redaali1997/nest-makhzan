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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [databaseConfig, redisConfig, jwtConfig, appConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (db: ConfigType<typeof databaseConfig>) => ({
        ...buildDataSourceOptions(db),
        autoLoadEntities: true,
      }),
    }),
    CatalogModule,
    InventoryModule,
    PaymentModule.forRootAsync({
      useFactory: (config: ConfigType<typeof appConfig>) => ({
        mode: config.env === 'test' ? 'failing' : 'mock',
      }),
      inject: [appConfig.KEY],
    }),
  ],
})
export class AppModule {}
