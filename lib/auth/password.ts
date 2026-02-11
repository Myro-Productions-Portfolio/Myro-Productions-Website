/**
 * Password Hashing and Verification Utilities
 *
 * Uses bcrypt for secure password hashing with 12 rounds
 * Bcrypt is a secure password hashing library
 */

import bcrypt from 'bcrypt';

/**
 * Number of salt rounds for bcrypt hashing
 * 12 rounds provides a good balance between security and performance
 * Each increment doubles the computation time, making brute force attacks harder
 */
const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 *
 * @param password - The plain text password to hash
 * @returns Promise that resolves to the hashed password
 * @throws Error if password is empty or hashing fails
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.trim().length === 0) {
    throw new Error('Password cannot be empty');
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a plain text password against a hash
 *
 * @param password - The plain text password to verify
 * @param hash - The hashed password to compare against
 * @returns Promise that resolves to true if password matches, false otherwise
 * @throws Error if inputs are invalid
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || password.trim().length === 0) {
    throw new Error('Password cannot be empty');
  }

  if (!hash || hash.trim().length === 0) {
    throw new Error('Hash cannot be empty');
  }

  try {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    console.error('Password verification error:', error);
    throw new Error('Failed to verify password');
  }
}
