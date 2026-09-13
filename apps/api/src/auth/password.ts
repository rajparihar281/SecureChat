import argon2 from 'argon2';

/**
 * Argon2id password hashing and verification service.
 * Uses OWASP-recommended parameters: memoryCost 64MB, timeCost 3 iterations, parallelism 1.
 */
export class PasswordService {
  private static readonly HASH_OPTIONS: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 1,
  };

  /**
   * Hashes a plaintext password using Argon2id.
   */
  static async hash(password: string): Promise<string> {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    return argon2.hash(password, this.HASH_OPTIONS);
  }

  /**
   * Verifies a plaintext password against an Argon2 hash.
   */
  static async verify(hash: string, plaintext: string): Promise<boolean> {
    if (!hash || !plaintext) {
      return false;
    }
    try {
      return await argon2.verify(hash, plaintext);
    } catch {
      return false;
    }
  }
}
