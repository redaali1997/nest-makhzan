import { registerAs } from '@nestjs/config';
import { validateEnv } from './env.validation';

export default registerAs('jwt', () => {
  const env = validateEnv(process.env);

  return {
    secret: env.JWT_SECRET,
  };
});
