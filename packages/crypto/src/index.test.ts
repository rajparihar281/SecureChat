import { CRYPTO_VERSION } from './index';

describe('Crypto Package Foundation', () => {
  it('exports CRYPTO_VERSION', () => {
    expect(CRYPTO_VERSION).toBe('1.0.0');
  });
});
