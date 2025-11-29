/**
 * Credentials Generator Utility
 * Generates unique username and password for IPTV service credentials
 */

/**
 * Generates a unique username based on customer name
 * Format: First 4 characters of name (uppercase) + 8 random digits
 * Example: "John" -> "JOHN12345678"
 */
export function generateUsername(customerName: string): string {
  // Get first 4 characters of name, uppercase, remove spaces
  const namePart = customerName
    .trim()
    .replace(/\s+/g, '')
    .substring(0, 4)
    .toUpperCase()
    .padEnd(4, 'X'); // Pad with X if name is too short

  // Generate 8 random digits
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();

  return `${namePart}${randomDigits}`;
}

/**
 * Generates a random password
 * Format: 10 characters (letters + numbers)
 * Example: "AB3K9XZ4Q2"
 */
export function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';

  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
}

/**
 * Generates complete credentials for a customer
 */
export interface CustomerCredentials {
  username: string;
  password: string;
  serviceUrl: string;
}

export function generateCredentials(customerName: string): CustomerCredentials {
  return {
    username: generateUsername(customerName),
    password: generatePassword(),
    serviceUrl: 'http://ky-tv.cc'
  };
}


