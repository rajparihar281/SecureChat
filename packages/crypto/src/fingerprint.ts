import nacl from 'tweetnacl';
import { decodeBase64 } from 'tweetnacl-util';
import { validateKey } from './keys';

/**
 * Derives a deterministic 60-digit safety number between two public keys.
 * Uses SHA-512 over the lexicographically sorted public key bytes to ensure symmetry:
 * generateSafetyNumber(alice, bob) === generateSafetyNumber(bob, alice).
 *
 * Formatted into 12 blocks of 5 digits (e.g. "12345 67890 ...").
 */
export function generateSafetyNumberBlocks(keyABase64: string, keyBBase64: string): string[] {
  validateKey(keyABase64);
  validateKey(keyBBase64);

  const bytesA = decodeBase64(keyABase64);
  const bytesB = decodeBase64(keyBBase64);

  // Compare bytes lexicographically
  let aFirst = true;
  for (let i = 0; i < 32; i++) {
    const byteA = bytesA[i] ?? 0;
    const byteB = bytesB[i] ?? 0;
    if (byteA !== byteB) {
      aFirst = byteA < byteB;
      break;
    }
  }

  const combined = new Uint8Array(64);
  if (aFirst) {
    combined.set(bytesA, 0);
    combined.set(bytesB, 32);
  } else {
    combined.set(bytesB, 0);
    combined.set(bytesA, 32);
  }

  // Iterative SHA-512 hashing for key derivation
  let digest = nacl.hash(combined);
  for (let round = 0; round < 1000; round++) {
    const nextInput = new Uint8Array(digest.length + combined.length);
    nextInput.set(digest, 0);
    nextInput.set(combined, digest.length);
    digest = nacl.hash(nextInput);
  }

  const blocks: string[] = [];
  // 12 blocks of 5 digits each, extracted from 4-byte integers in the 64-byte digest
  for (let i = 0; i < 12; i++) {
    const offset = i * 4;
    const val =
      ((digest[offset] ?? 0) << 24) |
      ((digest[offset + 1] ?? 0) << 16) |
      ((digest[offset + 2] ?? 0) << 8) |
      (digest[offset + 3] ?? 0);

    const positiveVal = Math.abs(val);
    const blockNum = positiveVal % 100000;
    blocks.push(blockNum.toString().padStart(5, '0'));
  }

  return blocks;
}

export function generateSafetyNumber(keyABase64: string, keyBBase64: string): string {
  return generateSafetyNumberBlocks(keyABase64, keyBBase64).join(' ');
}

/**
 * Generates an 8-segment hex fingerprint for an individual public key (e.g. for key cards and profiles).
 */
export function generateFingerprintHex(publicKeyBase64: string): string {
  validateKey(publicKeyBase64);
  const bytes = decodeBase64(publicKeyBase64);
  const hash = nacl.hash(bytes);

  const hexGroups: string[] = [];
  for (let i = 0; i < 8; i++) {
    const b1 = (hash[i * 2] ?? 0).toString(16).padStart(2, '0');
    const b2 = (hash[i * 2 + 1] ?? 0).toString(16).padStart(2, '0');
    hexGroups.push((b1 + b2).toUpperCase());
  }

  return hexGroups.join('-');
}
