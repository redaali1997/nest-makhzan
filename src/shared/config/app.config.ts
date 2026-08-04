import { registerAs } from '@nestjs/config';
import { validateEnv } from './env.validation';

export default registerAs('app', () => {
  const env = validateEnv(process.env);
  return {
    env: env.NODE_ENV,
    port: env.PORT,
  };
});
