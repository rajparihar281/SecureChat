import { startServer } from './server.js';
import { APP_NAME } from '@securechat/shared';

export * from './server.js';
export * from './auth/password.js';
export * from './auth/jwt.js';
export * from './auth/session.js';
export * from './graphql/errors.js';
export * from './graphql/context.js';
export * from './graphql/typeDefs.js';
export * from './graphql/resolvers/index.js';
export * from './db/memoryStore.js';
export * from './db/index.js';

export function getApiStatus(): { status: string; app: string } {
  return { status: 'healthy', app: APP_NAME };
}

if (process.env.NODE_ENV !== 'test' && !process.env.DISABLE_AUTO_START) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
  });
}
