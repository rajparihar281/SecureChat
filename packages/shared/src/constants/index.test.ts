import { APP_NAME, AUTH_CONSTANTS, CRYPTO_CONSTANTS } from './index';

describe('Shared Constants', () => {
  it('defines valid APP_NAME and tokens', () => {
    expect(APP_NAME).toBe('SecureChat');
    expect(AUTH_CONSTANTS.ACCESS_TOKEN_KEY).toBeDefined();
    expect(CRYPTO_CONSTANTS.KEY_BYTES).toBe(32);
    expect(CRYPTO_CONSTANTS.NONCE_BYTES).toBe(24);
  });
});
