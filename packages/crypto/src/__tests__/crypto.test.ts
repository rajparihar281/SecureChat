import {
  generateIdentityKeyPair,
  generatePreKeyPair,
  deriveSharedKey,
  encryptMessage,
  decryptMessage,
  encryptSymmetric,
  decryptSymmetric,
  CryptoDecryptionError,
  InvalidKeyError,
} from '../index';
import { decodeBase64 } from 'tweetnacl-util';
import nacl from 'tweetnacl';

describe('@securechat/crypto - Core Primitives & E2EE', () => {
  describe('Key Generation & ECDH', () => {
    it('generates valid 32-byte Curve25519 identity keypairs', () => {
      const alice = generateIdentityKeyPair();

      expect(alice.publicKey).toBeDefined();
      expect(alice.secretKey).toBeDefined();

      const pubBytes = decodeBase64(alice.publicKey);
      const secBytes = decodeBase64(alice.secretKey);

      expect(pubBytes).toHaveLength(32);
      expect(secBytes).toHaveLength(32);
    });

    it('generates distinct keypairs on subsequent invocations', () => {
      const k1 = generateIdentityKeyPair();
      const k2 = generateIdentityKeyPair();

      expect(k1.publicKey).not.toBe(k2.publicKey);
      expect(k1.secretKey).not.toBe(k2.secretKey);
    });

    it('generates valid ephemeral pre-key pairs', () => {
      const preKey = generatePreKeyPair();
      expect(decodeBase64(preKey.publicKey)).toHaveLength(32);
      expect(decodeBase64(preKey.secretKey)).toHaveLength(32);
    });

    it('derives identical shared secrets via ECDH exchange (Diffie-Hellman symmetry)', () => {
      const alice = generateIdentityKeyPair();
      const bob = generateIdentityKeyPair();

      const sharedAlice = deriveSharedKey(alice.secretKey, bob.publicKey);
      const sharedBob = deriveSharedKey(bob.secretKey, alice.publicKey);

      expect(sharedAlice).toHaveLength(32);
      expect(sharedBob).toHaveLength(32);
      expect(Buffer.from(sharedAlice).equals(Buffer.from(sharedBob))).toBe(true);
    });

    it('throws InvalidKeyError when passing invalid key formats', () => {
      const alice = generateIdentityKeyPair();

      expect(() => deriveSharedKey('not-base64-!!', alice.publicKey)).toThrow(InvalidKeyError);
      expect(() => deriveSharedKey(alice.secretKey, 'too-short')).toThrow(InvalidKeyError);
      expect(() => deriveSharedKey('', alice.publicKey)).toThrow(InvalidKeyError);
    });
  });

  describe('Asymmetric Authenticated Encryption (X25519 + XSalsa20-Poly1305)', () => {
    it('encrypts and decrypts UTF-8 plaintext messages successfully', () => {
      const alice = generateIdentityKeyPair();
      const bob = generateIdentityKeyPair();

      const plaintexts = [
        'Hello Bob, this is a secret!',
        '',
        '🔐 E2EE with emojis 🚀 and non-ASCII chars: こんにちは мир',
        'A'.repeat(5000), // 5KB payload
      ];

      for (const text of plaintexts) {
        const payload = encryptMessage(text, alice.secretKey, alice.publicKey, bob.publicKey);

        expect(payload.ciphertext).toBeDefined();
        expect(payload.nonce).toBeDefined();
        expect(payload.senderPublicKey).toBe(alice.publicKey);
        expect(payload.recipientPublicKey).toBe(bob.publicKey);
        expect(payload.version).toBe(1);

        const decrypted = decryptMessage(payload, bob.secretKey);
        expect(decrypted).toBe(text);
      }
    });

    it('generates unique random nonces for identical plaintexts (prevents replay/frequency analysis)', () => {
      const alice = generateIdentityKeyPair();
      const bob = generateIdentityKeyPair();
      const text = 'Identical message';

      const payload1 = encryptMessage(text, alice.secretKey, alice.publicKey, bob.publicKey);
      const payload2 = encryptMessage(text, alice.secretKey, alice.publicKey, bob.publicKey);

      expect(payload1.nonce).not.toBe(payload2.nonce);
      expect(payload1.ciphertext).not.toBe(payload2.ciphertext);
    });

    it('fails to decrypt if ciphertext is tampered (Poly1305 authentication MAC failure)', () => {
      const alice = generateIdentityKeyPair();
      const bob = generateIdentityKeyPair();
      const text = 'Sensitive financial transfer instructions';

      const payload = encryptMessage(text, alice.secretKey, alice.publicKey, bob.publicKey);

      // Flip characters in base64 ciphertext
      const bytes = decodeBase64(payload.ciphertext);
      bytes[0] = (bytes[0] ?? 0) ^ 0xff;
      const tamperedPayload = {
        ...payload,
        ciphertext: Buffer.from(bytes).toString('base64'),
      };

      expect(() => decryptMessage(tamperedPayload, bob.secretKey)).toThrow(CryptoDecryptionError);
    });

    it('fails to decrypt if nonce is modified', () => {
      const alice = generateIdentityKeyPair();
      const bob = generateIdentityKeyPair();

      const payload = encryptMessage('Message', alice.secretKey, alice.publicKey, bob.publicKey);

      const nonceBytes = decodeBase64(payload.nonce);
      nonceBytes[0] = (nonceBytes[0] ?? 0) ^ 0x01;
      const tamperedPayload = {
        ...payload,
        nonce: Buffer.from(nonceBytes).toString('base64'),
      };

      expect(() => decryptMessage(tamperedPayload, bob.secretKey)).toThrow(CryptoDecryptionError);
    });

    it('fails to decrypt when attempted by an eavesdropper (Eve) with incorrect private key', () => {
      const alice = generateIdentityKeyPair();
      const bob = generateIdentityKeyPair();
      const eve = generateIdentityKeyPair();

      const payload = encryptMessage(
        'Top secret for Bob',
        alice.secretKey,
        alice.publicKey,
        bob.publicKey,
      );

      expect(() => decryptMessage(payload, eve.secretKey)).toThrow(CryptoDecryptionError);
    });
  });

  describe('Symmetric Authenticated Encryption (secretbox)', () => {
    it('encrypts and decrypts arbitrary binary payloads (e.g. attachments)', () => {
      const symmetricKey = nacl.randomBytes(32);
      const fileBuffer = new Uint8Array([1, 2, 3, 4, 5, 42, 100, 255]);

      const encrypted = encryptSymmetric(fileBuffer, symmetricKey);
      expect(encrypted.ciphertextBytes).toBeDefined();
      expect(encrypted.nonceBase64).toBeDefined();

      const decrypted = decryptSymmetric(
        encrypted.ciphertextBytes,
        encrypted.nonceBase64,
        symmetricKey,
      );
      expect(decrypted).toEqual(fileBuffer);
    });

    it('fails symmetric decryption when key is incorrect or data is corrupt', () => {
      const key1 = nacl.randomBytes(32);
      const key2 = nacl.randomBytes(32);
      const data = new Uint8Array([10, 20, 30]);

      const encrypted = encryptSymmetric(data, key1);

      expect(() =>
        decryptSymmetric(encrypted.ciphertextBytes, encrypted.nonceBase64, key2),
      ).toThrow(CryptoDecryptionError);
    });
  });
});
