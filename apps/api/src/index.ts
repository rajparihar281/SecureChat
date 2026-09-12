import { APP_NAME } from '@securechat/shared';

console.info(`Starting ${APP_NAME} GraphQL API server...`);

export function getApiStatus(): { status: string; app: string } {
  return { status: 'healthy', app: APP_NAME };
}
