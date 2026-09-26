import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import { InvalidKeyError } from './errors';

export interface KeyPairBase64 {
  publicKey: string;
  secretKey: string;
}

export function validateKey(
  keyBase64: string,
  expectedLength = nacl.box.publicKeyLength,
): Uint8Array {
  if (!keyBase64 || typeof keyBase64 !== 'string') {
    throw new InvalidKeyError('Key must be a non-empty base64 string');
  }

  let bytes: Uint8Array;
  try {
    bytes = decodeBase64(keyBase64);
  } catch {
    throw new InvalidKeyError('Key contains invalid base64 characters');
  }

  if (bytes.length !== expectedLength) {
    throw new InvalidKeyError(
      `Invalid key length: expected ${expectedLength} bytes, received ${bytes.length} bytes`,
    );
  }

  return bytes;
}

/**
 * Generates a Curve25519 (X25519) identity key pair for user device authentication and ECDH.
 */
export function generateIdentityKeyPair(): KeyPairBase64 {
  const pair = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(pair.publicKey),
    secretKey: encodeBase64(pair.secretKey),
  };
}

/**
 * Generates an ephemeral or signed pre-key pair for asynchronous key exchange.
 */
export function generatePreKeyPair(): KeyPairBase64 {
  const pair = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(pair.publicKey),
    secretKey: encodeBase64(pair.secretKey),
  };
}

/**
 * Computes an X25519 Diffie-Hellman shared secret between a secret key and a peer's public key.
 */
export function deriveSharedKey(
  mySecretKeyBase64: string,
  peerPublicKeyBase64: string,
): Uint8Array {
  const secretKeyBytes = validateKey(mySecretKeyBase64, nacl.box.secretKeyLength);
  const publicKeyBytes = validateKey(peerPublicKeyBase64, nacl.box.publicKeyLength);

  return nacl.box.before(publicKeyBytes, secretKeyBytes);
}
