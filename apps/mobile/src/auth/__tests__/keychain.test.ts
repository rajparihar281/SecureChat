import {
  saveTokens,
  getTokens,
  clearTokens,
  saveDeviceIdentity,
  getDeviceIdentity,
  clearAllSecureStorage,
  setUseFallbackStore,
  clearMemoryFallback,
} from '../keychain';

describe('Keychain Secure Storage', () => {
  beforeEach(() => {
    setUseFallbackStore(true);
    clearMemoryFallback();
  });

  afterAll(() => {
    setUseFallbackStore(false);
  });

  it('saves, retrieves, and clears authentication tokens', async () => {
    const initialTokens = await getTokens();
    expect(initialTokens).toBeNull();

    await saveTokens({
      accessToken: 'access_jwt_123',
      refreshToken: 'refresh_jwt_456',
    });

    const storedTokens = await getTokens();
    expect(storedTokens).toEqual({
      accessToken: 'access_jwt_123',
      refreshToken: 'refresh_jwt_456',
    });

    await clearTokens();
    const afterClearTokens = await getTokens();
    expect(afterClearTokens).toBeNull();
  });

  it('saves and retrieves device identity', async () => {
    const initialDevice = await getDeviceIdentity();
    expect(initialDevice).toBeNull();

    await saveDeviceIdentity({
      deviceId: 'dev_test_abc',
      deviceName: 'Pixel 8 Pro',
    });

    const storedDevice = await getDeviceIdentity();
    expect(storedDevice).toEqual({
      deviceId: 'dev_test_abc',
      deviceName: 'Pixel 8 Pro',
    });
  });

  it('clears all secure storage entries', async () => {
    await saveTokens({ accessToken: 'a', refreshToken: 'r' });
    await saveDeviceIdentity({ deviceId: 'd', deviceName: 'n' });

    await clearAllSecureStorage();

    expect(await getTokens()).toBeNull();
    expect(await getDeviceIdentity()).toBeNull();
  });
});
