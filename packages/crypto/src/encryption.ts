import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';
import { CryptoDecryptionError } from './errors';
import { validateKey, deriveSharedKey } from './keys';

export interface EncryptedPayload {
  ciphertext: string;
  nonce: string;
  senderPublicKey: string;
  recipientPublicKey: string;
  version: number;
}

export interface SymmetricEncryptedData {
  ciphertext: string;
  nonce: string;
}

export const PROTOCOL_VERSION = 1;

/**
 * Encrypts an arbitrary UTF-8 plaintext message using X25519 ECDH + authenticated XSalsa20-Poly1305.
 * Generates a fresh cryptographically secure random 24-byte nonce for each message.
 */
export function encryptMessage(
  plaintext: string,
  senderSecretKey: string,
  senderPublicKey: string,
  recipientPublicKey: string,
): EncryptedPayload {
  // Validate public and private keys
  validateKey(senderSecretKey, nacl.box.secretKeyLength);
  validateKey(senderPublicKey, nacl.box.publicKeyLength);
  validateKey(recipientPublicKey, nacl.box.publicKeyLength);

  const sharedKey = deriveSharedKey(senderSecretKey, recipientPublicKey);
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageBytes = decodeUTF8(plaintext);

  const boxBytes = nacl.box.after(messageBytes, nonce, sharedKey);

  return {
    ciphertext: encodeBase64(boxBytes),
    nonce: encodeBase64(nonce),
    senderPublicKey,
    recipientPublicKey,
    version: PROTOCOL_VERSION,
  };
}

/**
 * Decrypts an encrypted payload using the recipient's private key and the sender's public key.
 * Throws CryptoDecryptionError if the ciphertext or authentication tag has been tampered with.
 */
export function decryptMessage(payload: EncryptedPayload, recipientSecretKey: string): string {
  validateKey(recipientSecretKey, nacl.box.secretKeyLength);
  validateKey(payload.senderPublicKey, nacl.box.publicKeyLength);

  let nonceBytes: Uint8Array;
  let ciphertextBytes: Uint8Array;

  try {
    nonceBytes = decodeBase64(payload.nonce);
    ciphertextBytes = decodeBase64(payload.ciphertext);
  } catch {
    throw new CryptoDecryptionError('Invalid base64 payload components');
  }

  if (nonceBytes.length !== nacl.box.nonceLength) {
    throw new CryptoDecryptionError(
      `Invalid nonce length: expected ${nacl.box.nonceLength} bytes, received ${nonceBytes.length}`,
    );
  }

  const sharedKey = deriveSharedKey(recipientSecretKey, payload.senderPublicKey);
  const openedBytes = nacl.box.open.after(ciphertextBytes, nonceBytes, sharedKey);

  if (!openedBytes) {
    throw new CryptoDecryptionError(
      'Decryption failed: corrupted ciphertext, authentication MAC mismatch, or invalid key',
    );
  }

  return encodeUTF8(openedBytes);
}

/**
 * Encrypts arbitrary binary data (e.g. media file attachments) using symmetric authenticated encryption (secretbox).
 */
export function encryptSymmetric(
  data: Uint8Array,
  secretKey: Uint8Array,
): { ciphertextBytes: Uint8Array; nonceBase64: string } {
  if (secretKey.length !== nacl.secretbox.keyLength) {
    throw new CryptoDecryptionError(`Symmetric key must be ${nacl.secretbox.keyLength} bytes`);
  }

  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const ciphertextBytes = nacl.secretbox(data, nonce, secretKey);

  return {
    ciphertextBytes,
    nonceBase64: encodeBase64(nonce),
  };
}

/**
 * Decrypts symmetrically encrypted binary data.
 */
export function decryptSymmetric(
  ciphertextBytes: Uint8Array,
  nonceBase64: string,
  secretKey: Uint8Array,
): Uint8Array {
  if (secretKey.length !== nacl.secretbox.keyLength) {
    throw new CryptoDecryptionError(`Symmetric key must be ${nacl.secretbox.keyLength} bytes`);
  }

  const nonce = decodeBase64(nonceBase64);
  const decrypted = nacl.secretbox.open(ciphertextBytes, nonce, secretKey);

  if (!decrypted) {
    throw new CryptoDecryptionError('Symmetric decryption failed: corrupt data or bad key');
  }

  return decrypted;
}
