import { PasswordService } from './password';

describe('PasswordService (Argon2)', () => {
  it('hashes and verifies a valid password', async () => {
    const plaintext = 'SuperSecret123!';
    const hash = await PasswordService.hash(plaintext);

    expect(hash).toBeDefined();
    expect(hash.startsWith('$argon2id$')).toBe(true);

    const isValid = await PasswordService.verify(hash, plaintext);
    expect(isValid).toBe(true);

    const isWrong = await PasswordService.verify(hash, 'WrongPassword!');
    expect(isWrong).toBe(false);
  });

  it('rejects passwords shorter than 8 characters', async () => {
    await expect(PasswordService.hash('short')).rejects.toThrow(
      'Password must be at least 8 characters long',
    );
  });

  it('handles empty or malformed hash verification gracefully', async () => {
    expect(await PasswordService.verify('', 'test')).toBe(false);
    expect(await PasswordService.verify('invalid_hash', 'test')).toBe(false);
  });
});
