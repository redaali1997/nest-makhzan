import { registerAs } from '@nestjs/config';
import { env } from './env.validation';

export default registerAs('jwt', () => {
  const e = env();

  return {
    secret: e.JWT_SECRET,
  };
});
