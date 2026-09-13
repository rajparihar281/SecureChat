import { JwtService } from './jwt.js';
import { memoryDb } from '../db/memoryStore.js';
import { AuthenticationError } from '../graphql/errors.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
}

export class SessionService {
  /**
   * Issues a new token pair for a user and device, recording the refresh token hash
   */
  static issueTokens(userId: string, deviceId: string): AuthTokens {
    const accessToken = JwtService.signAccessToken(userId, deviceId);
    const { token: refreshToken } = JwtService.signRefreshToken(userId, deviceId);
    const refreshHash = JwtService.hashRefreshToken(refreshToken);

    memoryDb.setDeviceRefreshToken(userId, deviceId, refreshHash);

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 mins
    };
  }

  /**
   * Rotates a refresh token: verifies old token, checks against stored hash, revokes old, issues new pair
   */
  static rotateRefreshToken(oldRefreshToken: string): AuthTokens {
    let payload;
    try {
      payload = JwtService.verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const device = memoryDb.findDevice(payload.userId, payload.deviceId);
    if (!device) {
      throw new AuthenticationError('Device not recognized');
    }

    const providedHash = JwtService.hashRefreshToken(oldRefreshToken);
    if (device.refresh_token_hash !== providedHash) {
      // Possible token reuse attack detected: invalidate all sessions for this device
      memoryDb.setDeviceRefreshToken(payload.userId, payload.deviceId, null);
      throw new AuthenticationError(
        'Refresh token reuse detected. Device session has been invalidated.',
      );
    }

    // Issue new pair and rotate hash
    return this.issueTokens(payload.userId, payload.deviceId);
  }

  /**
   * Revokes a device's session on logout
   */
  static revokeSession(userId: string, deviceId: string): void {
    memoryDb.setDeviceRefreshToken(userId, deviceId, null);
  }
}
