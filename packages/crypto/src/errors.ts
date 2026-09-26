export class CryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CryptoError';
    Object.setPrototypeOf(this, CryptoError.prototype);
  }
}

export class CryptoDecryptionError extends CryptoError {
  constructor(message = 'Decryption failed: corrupted ciphertext, bad key, or MAC failure') {
    super(message);
    this.name = 'CryptoDecryptionError';
    Object.setPrototypeOf(this, CryptoDecryptionError.prototype);
  }
}

export class InvalidKeyError extends CryptoError {
  constructor(message = 'Invalid cryptographic key: expected 32-byte base64 string') {
    super(message);
    this.name = 'InvalidKeyError';
    Object.setPrototypeOf(this, InvalidKeyError.prototype);
  }
}
