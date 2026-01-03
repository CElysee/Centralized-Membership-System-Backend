import { createDecipheriv } from 'crypto';

import { compareSync } from 'bcryptjs';

import { ENCRYPTION_ALGORITHM, ENCRYPTION_KEY } from 'src/common/constants.common';

/**
 * A service that provides encryption utilities.
 */
export class EncryptionService {
  /**
   * Verifies if the given text matches the hashed text.
   * @param {string} text - The plain text to compare.
   * @param {string} hash - The hash to compare against.
   * @returns {boolean} True if the text matches the hash, false otherwise.
   */
  public static verifyHash(text: string, hash: string): boolean {
    return compareSync(text, hash);
  }

  /**
   * Decrypts the given hash.
   * @param {string} hash - The hash to decrypt.
   * @returns {object} The decrypted object.
   * @throws {Error} If the decryption fails.
   */
  public static decrypt(hash: string): object {
    const algorithm = ENCRYPTION_ALGORITHM!;
    const key = Buffer.from(ENCRYPTION_KEY!);

    const parts = hash.split(':');

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];

    const decipher = createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted).encrypt;
  }
}
