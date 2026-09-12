export const APP_NAME = 'SecureChat';
export const ANDROID_PACKAGE_NAME = 'com.securechat.app';

export const AUTH_CONSTANTS = {
  ACCESS_TOKEN_KEY: 'securechat_access_token',
  REFRESH_TOKEN_KEY: 'securechat_refresh_token',
  DEVICE_ID_KEY: 'securechat_device_id',
  ACCESS_TOKEN_EXPIRY_MINUTES: 15,
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
} as const;

export const CRYPTO_CONSTANTS = {
  IDENTITY_KEY_ALIAS: 'securechat_identity_keypair',
  NONCE_BYTES: 24,
  KEY_BYTES: 32,
  FINGERPRINT_BLOCK_SIZE: 5,
  FINGERPRINT_BLOCK_COUNT: 6,
} as const;

export const GRAPHQL_WS_EVENTS = {
  MESSAGE_SENT: 'MESSAGE_SENT',
  MESSAGE_STATUS_UPDATED: 'MESSAGE_STATUS_UPDATED',
  USER_TYPING: 'USER_TYPING',
} as const;
