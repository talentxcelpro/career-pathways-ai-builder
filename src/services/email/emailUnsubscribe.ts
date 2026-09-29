// src/services/email/emailUnsubscribe.ts
/**
 * Cryptographically signed one-click unsubscribe mechanism.
 * Allows recipients to unsubscribe from marketing/engagement communications
 * with a single click without requiring them to log in.
 */

const DEFAULT_SECRET = 'txc_email_unsub_secret_2026_talentxcel_platform';

function getUnsubscribeSecret(): string {
  if (typeof process !== 'undefined' && process.env?.EMAIL_UNSUBSCRIBE_SECRET) {
    return process.env.EMAIL_UNSUBSCRIBE_SECRET;
  }
  return DEFAULT_SECRET;
}

/**
 * Simple, fast HMAC-SHA256 equivalent using hex digests for token verification
 */
async function computeSignature(message: string, secret: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  // Deterministic fallback for non-crypto-subtle environments
  let hash = 0;
  const str = message + secret;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

function toBase64Url(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64url');
  }
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64url').toString('utf-8');
  }
  const unescaped = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = unescaped + '='.repeat((4 - unescaped.length % 4) % 4);
  return decodeURIComponent(escape(atob(padded)));
}

/**
 * Generates a signed, URL-safe token containing email and timestamp
 */
export async function generateUnsubscribeToken(email: string, userId?: string): Promise<string> {
  const cleanEmail = email.toLowerCase().trim();
  const timestamp = Date.now().toString(36);
  const rawPayload = `${cleanEmail}:${userId || ''}:${timestamp}`;
  const base64Payload = toBase64Url(rawPayload);
  const signature = await computeSignature(base64Payload, getUnsubscribeSecret());
  const token = `${base64Payload}.${signature.substring(0, 32)}`;
  return token;
}

/**
 * Validates a signed unsubscribe token and extracts the email and userId
 */
export async function verifyUnsubscribeToken(token: string): Promise<{ valid: boolean; email?: string; userId?: string; error?: string }> {
  try {
    if (!token || !token.includes('.')) {
      return { valid: false, error: 'Malformed unsubscribe token' };
    }

    const [base64Payload, sig] = token.split('.');
    const expectedSig = await computeSignature(base64Payload, getUnsubscribeSecret());
    
    if (expectedSig.substring(0, 32) !== sig) {
      return { valid: false, error: 'Invalid token signature' };
    }

    // Decode payload
    const decoded = fromBase64Url(base64Payload);
    const [email, userId] = decoded.split(':');

    if (!email || !email.includes('@')) {
      return { valid: false, error: 'Invalid recipient data in token' };
    }

    return {
      valid: true,
      email: email.toLowerCase().trim(),
      userId: userId || undefined
    };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Token verification failed' };
  }
}

/**
 * Generates canonical unsubscribe URL
 */
export async function buildUnsubscribeUrl(email: string, userId?: string): Promise<string> {
  const token = await generateUnsubscribeToken(email, userId);
  return `https://talentxcel.in/unsubscribe?token=${encodeURIComponent(token)}`;
}

/**
 * Generates List-Unsubscribe email headers compliant with RFC 8058 (One-Click Unsubscribe)
 */
export async function buildListUnsubscribeHeaders(email: string, userId?: string): Promise<Record<string, string>> {
  const token = await generateUnsubscribeToken(email, userId);
  const oneClickUrl = `https://talentxcel.in/api/email/unsubscribe?token=${encodeURIComponent(token)}&action=one_click`;
  const mailto = `mailto:unsubscribe@talentxcel.in?subject=unsubscribe:${token}`;

  return {
    'List-Unsubscribe': `<${oneClickUrl}>, <${mailto}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
  };
}
