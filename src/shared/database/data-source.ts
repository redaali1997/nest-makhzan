import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './typeorm.config';
import 'dotenv/config';

export default new DataSource({
  ...buildDataSourceOptions({
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_DATABASE!,
  }),
});
