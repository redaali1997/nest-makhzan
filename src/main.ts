import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import appConfig from './shared/config/app.config';
import { ConfigType } from '@nestjs/config';
import { InsufficientStockFilter } from './shared/filters/insufficient-stock.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const appEnv = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  app.useGlobalFilters(new InsufficientStockFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(appEnv.port);
}

void bootstrap();
