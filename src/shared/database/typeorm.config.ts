import { DataSourceOptions } from 'typeorm';

export const buildDataSourceOptions = (opts: {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  logging: boolean;
}): DataSourceOptions => ({
  type: 'mysql',
  ...opts,
  entities: [__dirname + '/../../modules/**/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
});
