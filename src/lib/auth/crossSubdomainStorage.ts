/**
 * TalentXcel Cross-Subdomain Auth Storage Adapter for Supabase GoTrue
 *
 * Implements a unified, secure session storage bridge across all TalentXcel
 * subdomains (*.talentxcel.in) while maintaining 100% backward compatibility
 * with window.localStorage.
 *
 * GOVERNANCE & SECURITY:
 * - Zero access tokens in URLs or query strings.
 * - Zero refresh tokens in query strings.
 * - Zero token leakage or insecure hash transfers.
 * - Standard Supabase session persistence with .talentxcel.in cookie synchronization.
 * - SameSite=Lax, Secure (on HTTPS), Path=/
 * - Strict size ceiling check (<= 3800 bytes) to stay safely within the 4096-byte browser limit.
 */

import { getCrossSubdomainCookieDomain } from '@/config/domainArchitecture';

const COOKIE_PREFIX = '__txc_sb_session';
const MAX_COOKIE_BYTES = 3800; // Safe browser cookie ceiling

function encodeForCookie(val: string): string {
  try {
    return btoa(
      encodeURIComponent(val).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  } catch {
    return encodeURIComponent(val);
  }
}

function decodeFromCookie(raw: string): string | null {
  try {
    const binary = atob(raw);
    const uriEncoded = Array.prototype.map.call(binary, (ch: string) =>
      '%' + ('00' + ch.charCodeAt(0).toString(16)).slice(-2)
    ).join('');
    return decodeURIComponent(uriEncoded);
  } catch {
    try {
      return decodeURIComponent(raw);
    } catch {
      return null;
    }
  }
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? match[3] : null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number = 2592000): void {
  if (typeof document === 'undefined') return;

  const cookieDomain = getCrossSubdomainCookieDomain();
  const domainPart = cookieDomain ? `; domain=${cookieDomain}` : '';
  const securePart = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${name}=${value}; path=/${domainPart}; max-age=${maxAgeSeconds}; SameSite=Lax${securePart}`;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;

  const cookieDomain = getCrossSubdomainCookieDomain();
  const domainPart = cookieDomain ? `; domain=${cookieDomain}` : '';
  const securePart = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';

  // Delete with domain
  document.cookie = `${name}=; path=/${domainPart}; max-age=0; SameSite=Lax${securePart}`;
  // Also delete host-only cookie if previously set without domain
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${securePart}`;
}

/**
 * Checks whether a serialized session string represents an unexpired Supabase session.
 */
function isValidSessionPayload(raw: string): boolean {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.access_token || !parsed.user) return false;
    if (parsed.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (parsed.expires_at <= now) return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Eagerly restores any cross-subdomain session from cookie into localStorage.
 * Called during app initialization so user is recognized as authenticated immediately.
 */
export function syncSessionFromCrossSubdomainCookie(targetKey?: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const encoded = getCookie(COOKIE_PREFIX);
    if (!encoded) return null;

    const raw = decodeFromCookie(encoded);
    if (!raw || !isValidSessionPayload(raw)) {
      deleteCookie(COOKIE_PREFIX);
      return null;
    }

    // Determine target localStorage key
    const key = targetKey || findSupabaseAuthKey() || 'sb-dthlgsnakhoftinssokm-auth-token';
    const existingLocal = window.localStorage.getItem(key);

    if (!existingLocal) {
      window.localStorage.setItem(key, raw);
    }

    return raw;
  } catch {
    return null;
  }
}

/**
 * Helper to discover the Supabase auth key present in localStorage
 */
function findSupabaseAuthKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
        return k;
      }
    }
  } catch {}
  return null;
}

/**
 * Supabase GoTrue compatible SupportedStorage implementation
 */
export const crossSubdomainStorage = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;

    try {
      // 1. Primary check: localStorage
      const localVal = window.localStorage.getItem(key);
      if (localVal && isValidSessionPayload(localVal)) {
        return localVal;
      }

      // 2. Secondary check: cross-subdomain cookie bridge
      const rawCookie = syncSessionFromCrossSubdomainCookie(key);
      if (rawCookie) {
        return rawCookie;
      }

      // 3. Fallback: return raw local value if present (e.g. non-session auth metadata)
      return localVal;
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;

    try {
      // 1. Write to localStorage
      window.localStorage.setItem(key, value);

      // 2. Synchronize to cross-subdomain cookie if valid session and fits size limit
      if (isValidSessionPayload(value)) {
        const encoded = encodeForCookie(value);
        if (encoded.length <= MAX_COOKIE_BYTES) {
          // Calculate max-age from session expires_at if available
          let maxAge = 2592000; // 30 days default
          try {
            const parsed = JSON.parse(value);
            if (parsed.expires_at) {
              const secondsLeft = parsed.expires_at - Math.floor(Date.now() / 1000);
              if (secondsLeft > 0) {
                maxAge = Math.min(secondsLeft, 2592000);
              }
            }
          } catch {}

          setCookie(COOKIE_PREFIX, encoded, maxAge);
        }
      }
    } catch (err) {
      console.warn('[CrossSubdomainStorage] Failed to store session:', err);
    }
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(key);
      deleteCookie(COOKIE_PREFIX);
    } catch (err) {
      console.warn('[CrossSubdomainStorage] Failed to clear session:', err);
    }
  },
};
