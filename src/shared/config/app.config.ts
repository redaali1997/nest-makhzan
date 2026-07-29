import { registerAs } from '@nestjs/config';
import { env } from './env.validation';

export default registerAs('app', () => {
  const e = env();
  return {
    env: e.NODE_ENV,
    port: e.PORT,
  };
});
