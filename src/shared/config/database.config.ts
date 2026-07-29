import { registerAs } from '@nestjs/config';
import { env } from './env.validation';

export default registerAs('database', () => {
  const e = env();

  return {
    host: e.DB_HOST,
    port: e.DB_PORT,
    database: e.DB_DATABASE,
    username: e.DB_USERNAME,
    password: e.DB_PASSWORD,
  };
});
