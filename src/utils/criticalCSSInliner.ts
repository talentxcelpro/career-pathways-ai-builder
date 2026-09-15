// Critical CSS for above-the-fold content
export const inlineCriticalCSS = () => {
  const criticalCSS = `
    /* Critical CSS for instant first paint */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Inter, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* Loading spinner */
    .initial-loader {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40px;
      height: 40px;
      border: 3px solid hsl(var(--muted, 220 14% 96%));
      border-top-color: hsl(var(--primary, 212 100% 48%));
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }
    
    /* Glass morphism base */
    .glass {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  `;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.id = 'critical-css';
  
  const existingCriticalCSS = document.getElementById('critical-css');
  if (!existingCriticalCSS) {
    document.head.insertBefore(style, document.head.firstChild);
  }
};
