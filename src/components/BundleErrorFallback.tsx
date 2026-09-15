import { FC, useEffect } from 'react';

interface BundleErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export const BundleErrorFallback: FC<BundleErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const isNative = typeof window !== 'undefined' && /Capacitor|wv/.test(navigator.userAgent);

  useEffect(() => {
    if (!error) return;

    const payload = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      route: window.location.href,
    };

    (window as typeof window & { __talentxcelBundleError?: typeof payload }).__talentxcelBundleError = payload;
    console.error('[BundleErrorFallback] Showing app recovery screen:', payload);
  }, [error]);

  const handleRefresh = async () => {
    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      }

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }

      sessionStorage.clear();
      localStorage.removeItem('supabase.auth.token');
    } catch (e) {
      console.error('[BundleErrorFallback] Refresh cleanup failed:', e);
    }

    window.location.reload();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: '#ffffff',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
        <div
          aria-hidden="true"
          style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '999px',
            backgroundColor: '#fef3c7',
            color: '#92400e',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '1rem',
          }}
        >
          !
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Please Refresh
        </h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          The app needs to reload. Click the button below.
        </p>

        <button
          onClick={handleRefresh}
          style={{
            width: '100%',
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
          }}
        >
          Refresh App
        </button>

        {resetErrorBoundary && (
          <button
            onClick={resetErrorBoundary}
            style={{
              width: '100%',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              marginTop: '0.75rem',
            }}
          >
            Try Again
          </button>
        )}

        {error && (
          <pre style={{
            marginTop: '1rem',
            maxHeight: '9rem',
            overflow: 'auto',
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            borderRadius: '0.375rem',
            backgroundColor: '#f9fafb',
            color: '#374151',
            padding: '0.75rem',
            fontSize: '0.75rem',
          }}>
            {error.name}: {error.message}
          </pre>
        )}
      </div>
    </div>
  );
};
