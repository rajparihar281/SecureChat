/**
 * @securechat/crypto
 * End-to-End Encryption engine using X25519 ECDH and authenticated symmetric encryption
 */

export const CRYPTO_VERSION = '1.0.0';

export interface KeyPairBase64 {
  publicKey: string;
  secretKey: string;
}
