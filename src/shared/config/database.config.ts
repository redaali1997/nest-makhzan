import { registerAs } from '@nestjs/config';
import { validateEnv } from './env.validation';

export default registerAs('database', () => {
  const env = validateEnv(process.env);

  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_DATABASE,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
  };
});
