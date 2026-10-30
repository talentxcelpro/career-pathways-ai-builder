// Google Identity Services configuration.
// Only the public Google Web OAuth Client ID belongs in the browser.
// Set VITE_GOOGLE_CLIENT_ID to the existing "TalentXcel Services" Web client ID.
const FALLBACK_CLIENT_ID =
  '888146676949-fl3fn4ijhgduneqmmpbbpamlio30lm8g.apps.googleusercontent.com';

export const GOOGLE_CLIENT_ID: string =
  (import.meta.env?.VITE_GOOGLE_CLIENT_ID as string | undefined) || FALLBACK_CLIENT_ID;

const GSI_SRC = 'https://accounts.google.com/gsi/client';

let loaderPromise: Promise<void> | null = null;

/** Loads the official Google Identity Services browser SDK exactly once with ultra-fast polling. */
export const loadGoogleIdentityServices = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      return resolve();
    }

    // High-frequency polling (20ms) to resolve the millisecond the SDK attaches to window
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(interval);
        resolve();
      }
    }, 20);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (window.google?.accounts?.id) {
        resolve();
      } else {
        reject(new Error('Google Identity Services timed out loading'));
      }
    }, 6000);

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src*="accounts.google.com/gsi/client"]`
    );

    if (existing) {
      existing.addEventListener('load', () => {
        clearInterval(interval);
        clearTimeout(timeout);
        if (window.google?.accounts?.id) {
          resolve();
        } else {
          setTimeout(() => resolve(), 25);
        }
      });
      existing.addEventListener('error', () => {
        clearInterval(interval);
        clearTimeout(timeout);
        reject(new Error('GSI script failed to load'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      clearInterval(interval);
      clearTimeout(timeout);
      if (window.google?.accounts?.id) {
        resolve();
      } else {
        setTimeout(() => resolve(), 25);
      }
    };
    script.onerror = () => {
      clearInterval(interval);
      clearTimeout(timeout);
      reject(new Error('GSI script failed to load'));
    };
    document.head.appendChild(script);
  }).catch((error) => {
    loaderPromise = null;
    throw error;
  });

  return loaderPromise;
};
