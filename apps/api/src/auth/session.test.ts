import { SessionService } from './session';
import { memoryDb } from '../db/memoryStore';

describe('SessionService', () => {
  const userId = 'user-test-session';
  const deviceId = 'device-test-session';

  beforeEach(() => {
    memoryDb.clear();
    memoryDb.users.set(userId, {
      id: userId,
      username: 'alice',
      email: 'alice@example.com',
      password_hash: 'hash',
      display_name: 'Alice',
      avatar_url: null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    memoryDb.registerDevice({
      user_id: userId,
      device_id: deviceId,
      device_name: 'Pixel 8',
      platform: 'ANDROID',
      public_key: 'test_public_key_base64',
    });
  });

  it('issues tokens and rotates refresh token', () => {
    const tokens = SessionService.issueTokens(userId, deviceId);
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();

    // Rotate refresh token
    const rotated = SessionService.rotateRefreshToken(tokens.refreshToken);
    expect(rotated.accessToken).toBeDefined();
    expect(rotated.refreshToken).toBeDefined();
    expect(rotated.refreshToken).not.toBe(tokens.refreshToken);

    // Old token should now be rejected as reuse
    expect(() => SessionService.rotateRefreshToken(tokens.refreshToken)).toThrow(
      'Refresh token reuse detected',
    );
  });

  it('revokes session on logout', () => {
    const tokens = SessionService.issueTokens(userId, deviceId);
    SessionService.revokeSession(userId, deviceId);

    expect(() => SessionService.rotateRefreshToken(tokens.refreshToken)).toThrow();
  });
});
