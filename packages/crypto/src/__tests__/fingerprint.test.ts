import {
  generateIdentityKeyPair,
  generateSafetyNumber,
  generateSafetyNumberBlocks,
  generateFingerprintHex,
} from '../index';

describe('@securechat/crypto - Safety Numbers & Fingerprints', () => {
  it('generates symmetric safety numbers regardless of argument order', () => {
    const alice = generateIdentityKeyPair();
    const bob = generateIdentityKeyPair();

    const snAliceBob = generateSafetyNumber(alice.publicKey, bob.publicKey);
    const snBobAlice = generateSafetyNumber(bob.publicKey, alice.publicKey);

    expect(snAliceBob).toBe(snBobAlice);
  });

  it('produces exactly 12 blocks of 5 decimal digits (60 digits total)', () => {
    const alice = generateIdentityKeyPair();
    const bob = generateIdentityKeyPair();

    const blocks = generateSafetyNumberBlocks(alice.publicKey, bob.publicKey);

    expect(blocks).toHaveLength(12);
    for (const block of blocks) {
      expect(block).toMatch(/^\d{5}$/);
    }

    const fullNumber = generateSafetyNumber(alice.publicKey, bob.publicKey);
    expect(fullNumber.split(' ')).toHaveLength(12);
    expect(fullNumber.replace(/\s/g, '')).toHaveLength(60);
  });

  it('is completely deterministic for identical keys', () => {
    const alice = generateIdentityKeyPair();
    const bob = generateIdentityKeyPair();

    const sn1 = generateSafetyNumber(alice.publicKey, bob.publicKey);
    const sn2 = generateSafetyNumber(alice.publicKey, bob.publicKey);

    expect(sn1).toBe(sn2);
  });

  it('produces drastically different safety numbers if a key changes (avalanche effect)', () => {
    const alice = generateIdentityKeyPair();
    const bob1 = generateIdentityKeyPair();
    const bob2 = generateIdentityKeyPair();

    const sn1 = generateSafetyNumber(alice.publicKey, bob1.publicKey);
    const sn2 = generateSafetyNumber(alice.publicKey, bob2.publicKey);

    expect(sn1).not.toBe(sn2);
  });

  it('generates formatted 8-segment hex fingerprints for individual public keys', () => {
    const alice = generateIdentityKeyPair();
    const hex = generateFingerprintHex(alice.publicKey);

    // Format: "XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
    expect(hex).toMatch(/^[0-9A-F]{4}(-[0-9A-F]{4}){7}$/);
  });
});
