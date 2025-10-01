import { FC } from 'react';

interface BundleErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export const BundleErrorFallback: FC<BundleErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  const handleRefresh = () => {
    try {
      if ('caches' in window) {
        caches.keys().then(names => names.forEach(name => caches.delete(name)));
      }
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '1rem',
      backgroundColor: '#ffffff'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
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
            fontWeight: '500'
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
              marginTop: '0.75rem'
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};