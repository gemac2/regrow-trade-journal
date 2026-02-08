import { createAuthClient } from '@neondatabase/neon-js/auth';

export const authClient = createAuthClient(
  process.env.BETTER_AUTH_URL!
);