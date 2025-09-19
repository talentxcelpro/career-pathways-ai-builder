// Critical CSS inlining utilities
export const criticalCSS = `
  /* Critical above-the-fold styles */
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --background: 240 10% 3.9%;
      --foreground: 0 0% 98%;
      --primary: 0 0% 98%;
      --primary-foreground: 240 5.9% 10%;
      --muted: 240 3.7% 15.9%;
      --muted-foreground: 240 5% 64.9%;
    }
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    font-family: system-ui, -apple-system, sans-serif;
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    line-height: 1.5;
  }

  /* Loading skeleton styles for immediate render */
  .skeleton {
    background: linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted)/0.5) 50%, hsl(var(--muted)) 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }

  @keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Critical navigation styles */
  .nav-critical {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: hsl(var(--background)/0.95);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid hsl(var(--muted));
    z-index: 1000;
  }
`;

export const injectCriticalCSS = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }
};

export const loadNonCriticalCSS = () => {
  if (typeof document !== 'undefined') {
    // Load non-critical CSS after page load
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/index.css';
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
    document.head.appendChild(link);
  }
};