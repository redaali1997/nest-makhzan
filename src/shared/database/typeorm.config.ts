import { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

export const buildDataSourceOptions = (opts: {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}): DataSourceOptions => ({
  type: 'mysql',
  ...opts,
  entities: [__dirname + '/../../modules/**/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
  logging: process.env.NODE_ENV === 'development' ? true : false,
});
