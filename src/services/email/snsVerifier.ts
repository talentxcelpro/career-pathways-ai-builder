// src/services/email/snsVerifier.ts
/**
 * Cryptographic Amazon SNS Message Signature Verifier
 * Verifies authenticity of incoming SNS notifications for SES bounces, complaints, and delivery events.
 *
 * Security Requirements:
 * 1. Strict validation of SigningCertURL (must be HTTPS from official amazonaws.com domain)
 * 2. Strict validation of SubscribeURL (prevents SSRF attacks)
 * 3. RSA-SHA1 / RSA-SHA256 signature verification matching AWS SNS specification
 * 4. In-memory certificate caching with TTL
 */

import crypto from 'crypto';

interface SnsMessagePayload {
  Type: string;
  MessageId: string;
  Token?: string;
  TopicArn: string;
  Subject?: string;
  Message: string;
  Timestamp: string;
  SignatureVersion: string;
  Signature: string;
  SigningCertURL?: string;
  SubscribeURL?: string;
}

// In-memory cache for validated AWS X.509 certificates (URL -> { cert, expiresAt })
const certCache = new Map<string, { cert: string; expiresAt: number }>();
const CERT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const SNS_HOST_PATTERN = /^sns\.[a-z0-9\-]+\.amazonaws\.com$/i;

/**
 * Validates that an AWS SNS certificate URL is legitimate and safe
 */
export function isValidCertUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') return false;
    if (!SNS_HOST_PATTERN.test(parsed.hostname)) return false;
    if (!parsed.pathname.endsWith('.pem')) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates that an SNS SubscribeURL is legitimate and safe before making any request
 */
export function isValidSubscribeUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') return false;
    if (!SNS_HOST_PATTERN.test(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Builds the canonical string to verify according to AWS SNS spec
 */
export function buildCanonicalString(payload: SnsMessagePayload): string {
  const parts: string[] = [];

  if (payload.Type === 'Notification') {
    parts.push('Message', payload.Message);
    parts.push('MessageId', payload.MessageId);
    if (payload.Subject !== undefined && payload.Subject !== null) {
      parts.push('Subject', payload.Subject);
    }
    parts.push('Timestamp', payload.Timestamp);
    parts.push('TopicArn', payload.TopicArn);
    parts.push('Type', payload.Type);
  } else if (payload.Type === 'SubscriptionConfirmation' || payload.Type === 'UnsubscribeConfirmation') {
    parts.push('Message', payload.Message);
    parts.push('MessageId', payload.MessageId);
    if (payload.SubscribeURL) {
      parts.push('SubscribeURL', payload.SubscribeURL);
    }
    parts.push('Timestamp', payload.Timestamp);
    if (payload.Token) {
      parts.push('Token', payload.Token);
    }
    parts.push('TopicArn', payload.TopicArn);
    parts.push('Type', payload.Type);
  } else {
    throw new Error(`Unsupported SNS message type: ${payload.Type}`);
  }

  // Format: Key\nValue\nKey\nValue\n
  return parts.join('\n') + '\n';
}

/**
 * Fetches and caches the AWS public certificate
 */
async function fetchCertificate(certUrl: string): Promise<string> {
  const cached = certCache.get(certUrl);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.cert;
  }

  if (!isValidCertUrl(certUrl)) {
    throw new Error(`Invalid or untrusted SigningCertURL: ${certUrl}`);
  }

  const response = await fetch(certUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch certificate from ${certUrl}: ${response.statusText}`);
  }

  const cert = await response.text();
  certCache.set(certUrl, {
    cert,
    expiresAt: Date.now() + CERT_CACHE_TTL_MS
  });

  return cert;
}

/**
 * Verifies an Amazon SNS message payload.
 * Returns true if valid, or throws/returns false if invalid.
 */
export async function verifySnsSignature(payload: SnsMessagePayload): Promise<{ valid: boolean; reason?: string }> {
  // If running in development or console test mode and no signature is provided, allow pass-through
  const isSafeMode = (process.env.EMAIL_MODE || 'console').toLowerCase() === 'console';
  if (!payload.Signature || !payload.SigningCertURL) {
    if (isSafeMode || process.env.NODE_ENV === 'test') {
      return { valid: true, reason: 'Bypassed in test/console mode (missing signature headers)' };
    }
    return { valid: false, reason: 'Missing required Signature or SigningCertURL in production mode' };
  }

  try {
    const cert = await fetchCertificate(payload.SigningCertURL);
    const canonicalString = buildCanonicalString(payload);

    const sigAlgorithm = payload.SignatureVersion === '2' ? 'RSA-SHA256' : 'RSA-SHA1';
    const verifier = crypto.createVerify(sigAlgorithm);
    verifier.update(canonicalString, 'utf8');

    const isValid = verifier.verify(cert, payload.Signature, 'base64');
    if (!isValid) {
      return { valid: false, reason: 'Cryptographic signature verification failed' };
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, reason: err.message || 'Signature verification exception' };
  }
}
