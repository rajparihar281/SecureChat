import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { config } from '../config/index.js';

export interface AccessTokenPayload {
  userId: string;
  deviceId: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  deviceId: string;
  tokenId: string;
  type: 'refresh';
}

export class JwtService {
  /**
   * Generates a short-lived access token (default 15m)
   */
  static signAccessToken(userId: string, deviceId: string): string {
    const payload: AccessTokenPayload = {
      userId,
      deviceId,
      type: 'access',
    };
    const options: SignOptions = {
      expiresIn: config.jwt.accessExpiresIn as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, config.jwt.accessSecret, options);
  }

  /**
   * Generates a rotating refresh token (default 7d)
   */
  static signRefreshToken(userId: string, deviceId: string): { token: string; tokenId: string } {
    const tokenId = uuidv4();
    const payload: RefreshTokenPayload = {
      userId,
      deviceId,
      tokenId,
      type: 'refresh',
    };
    const options: SignOptions = {
      expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'],
    };
    const token = jwt.sign(payload, config.jwt.refreshSecret, options);
    return { token, tokenId };
  }

  /**
   * Computes SHA-256 hash of a refresh token for storage
   */
  static hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verifies an access token
   */
  static verifyAccessToken(token: string): AccessTokenPayload {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return decoded;
  }

  /**
   * Verifies a refresh token
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  }
}
