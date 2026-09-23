import { APP_NAME } from '@securechat/shared';

export const MOBILE_APP_TITLE = APP_NAME;

export function getAppInfo(): { name: string; version: string } {
  return { name: APP_NAME, version: '1.0.0' };
}

export * from './graphql';
export * from './auth';
export * from './queue';
