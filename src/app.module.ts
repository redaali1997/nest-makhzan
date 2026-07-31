import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { validateEnv } from './shared/config/env.validation';
import databaseConfig from './shared/config/database.config';
import redisConfig from './shared/config/redis.config';
import jwtConfig from './shared/config/jwt.config';
import appConfig from './shared/config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogModule } from './modules/catalog/catalog.module';
import { InventoryModule } from './modules/inventory/inventory.module';

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
        type: 'mysql',
        host: db.host,
        port: db.port,
        database: db.database,
        username: db.username,
        password: db.password,
        autoLoadEntities: true,
        synchronize: false,
        migrations: [__dirname + '/shared/database/migrations/*{.ts,.js}'],
      }),
    }),
    CatalogModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
