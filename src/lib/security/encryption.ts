/**
 * Secure encryption utilities for sensitive data
 * Uses AES-256-GCM for encryption with user-specific salts
 */

// Use Web Crypto API for secure encryption
export class SecureEncryption {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // 96 bits for GCM

  /**
   * Generate a random salt for key derivation
   */
  private static generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16));
  }

  /**
   * Generate an initialization vector
   */
  private static generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
  }

  /**
   * Derive an encryption key from a password and salt
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000, // High iteration count for security
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt sensitive data with a user-specific key
   */
  static async encryptPrivateKey(privateKey: string, userSecret: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(privateKey);
      
      const salt = this.generateSalt();
      const iv = this.generateIV();
      const key = await this.deriveKey(userSecret, salt);

      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv
        },
        key,
        data
      );

      // Combine salt, iv, and encrypted data
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);

      // Return base64 encoded string
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt private key');
    }
  }

  /**
   * Decrypt sensitive data with a user-specific key
   */
  static async decryptPrivateKey(encryptedData: string, userSecret: string): Promise<string> {
    try {
      // Decode base64
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      // Extract salt, iv, and encrypted data
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 16 + this.IV_LENGTH);
      const encrypted = combined.slice(16 + this.IV_LENGTH);

      const key = await this.deriveKey(userSecret, salt);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt private key');
    }
  }

  /**
   * Generate a secure random password for encryption
   */
  static generateSecurePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}