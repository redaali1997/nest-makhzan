import { registerAs } from '@nestjs/config';
import { env } from './env.validation';

export default registerAs('redis', () => {
  const e = env();
  return { host: e.REDIS_HOST, port: e.REDIS_PORT };
});
