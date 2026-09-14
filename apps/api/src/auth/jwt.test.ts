import { JwtService } from './jwt';

describe('JwtService', () => {
  const userId = 'user-1234-uuid';
  const deviceId = 'device-5678-uuid';

  it('signs and verifies an access token', () => {
    const token = JwtService.signAccessToken(userId, deviceId);
    expect(typeof token).toBe('string');

    const decoded = JwtService.verifyAccessToken(token);
    expect(decoded.userId).toBe(userId);
    expect(decoded.deviceId).toBe(deviceId);
    expect(decoded.type).toBe('access');
  });

  it('signs and verifies a rotating refresh token', () => {
    const { token, tokenId } = JwtService.signRefreshToken(userId, deviceId);
    expect(typeof token).toBe('string');
    expect(tokenId).toBeDefined();

    const decoded = JwtService.verifyRefreshToken(token);
    expect(decoded.userId).toBe(userId);
    expect(decoded.deviceId).toBe(deviceId);
    expect(decoded.tokenId).toBe(tokenId);
    expect(decoded.type).toBe('refresh');
  });

  it('computes consistent sha-256 hash for refresh tokens', () => {
    const token = 'sample-refresh-token';
    const hash1 = JwtService.hashRefreshToken(token);
    const hash2 = JwtService.hashRefreshToken(token);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });

  it('fails verification on tampered token', () => {
    const token = JwtService.signAccessToken(userId, deviceId);
    const tampered = token.slice(0, -5) + 'xxxxx';
    expect(() => JwtService.verifyAccessToken(tampered)).toThrow();
  });
});
