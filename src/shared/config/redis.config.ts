import { registerAs } from '@nestjs/config';
import { validateEnv } from './env.validation';

export default registerAs('redis', () => {
  const env = validateEnv(process.env);

  return { host: env.REDIS_HOST, port: env.REDIS_PORT };
});
