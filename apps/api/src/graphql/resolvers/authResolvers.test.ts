import { authResolvers } from './authResolvers';
import { memoryDb } from '../../db/memoryStore';

describe('authResolvers', () => {
  beforeEach(() => {
    memoryDb.clear();
  });

  it('registers a new user and returns tokens', async () => {
    const res = await authResolvers.Mutation.register(
      {},
      {
        input: {
          username: 'bob_crypto',
          email: 'bob@securechat.io',
          password: 'Password123!',
          displayName: 'Bob The Builder',
          deviceId: 'dev-bob-01',
          deviceName: 'Pixel 7',
          platform: 'ANDROID',
          publicKey: 'base64_bob_identity_key',
        },
      },
    );

    expect(res.user.username).toBe('bob_crypto');
    expect(res.user.email).toBe('bob@securechat.io');
    expect(res.accessToken).toBeDefined();
    expect(res.refreshToken).toBeDefined();
    expect(res.device.deviceId).toBe('dev-bob-01');
  });

  it('logs in an existing user with valid credentials', async () => {
    await authResolvers.Mutation.register(
      {},
      {
        input: {
          username: 'charlie',
          email: 'charlie@securechat.io',
          password: 'CorrectPassword123!',
          displayName: 'Charlie',
          deviceId: 'dev-charlie-01',
          deviceName: 'Galaxy S23',
          platform: 'ANDROID',
          publicKey: 'base64_charlie_key',
        },
      },
    );

    const loginRes = await authResolvers.Mutation.login(
      {},
      {
        input: {
          identifier: 'charlie@securechat.io',
          password: 'CorrectPassword123!',
          deviceId: 'dev-charlie-02',
          deviceName: 'Galaxy Tab',
          platform: 'ANDROID',
          publicKey: 'base64_charlie_tab_key',
        },
      },
    );

    expect(loginRes.user.username).toBe('charlie');
    expect(loginRes.device.deviceId).toBe('dev-charlie-02');
    expect(loginRes.accessToken).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    await authResolvers.Mutation.register(
      {},
      {
        input: {
          username: 'dave',
          email: 'dave@securechat.io',
          password: 'DavePassword123!',
          displayName: 'Dave',
          deviceId: 'dev-dave-01',
          deviceName: 'Pixel',
          platform: 'ANDROID',
          publicKey: 'base64_dave_key',
        },
      },
    );

    await expect(
      authResolvers.Mutation.login(
        {},
        {
          input: {
            identifier: 'dave',
            password: 'WrongPassword!',
            deviceId: 'dev-dave-01',
            deviceName: 'Pixel',
            platform: 'ANDROID',
            publicKey: 'base64_dave_key',
          },
        },
      ),
    ).rejects.toThrow('Invalid username/email or password');
  });
});
