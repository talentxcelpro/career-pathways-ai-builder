// 🔴 Fix #2 & #5: Font loading optimization to prevent layout shift

export const optimizeFontLoading = () => {
  // Create font face with font-display: swap
  const fontCSS = `
    @font-face {
      font-family: 'Inter Variable';
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
      src: url('/fonts/inter-var.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    
    @font-face {
      font-family: 'Geist Sans';
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
      src: url('/fonts/geist-sans.woff2') format('woff2');
    }
  `;

  // Inject optimized font CSS
  const style = document.createElement('style');
  style.textContent = fontCSS;
  document.head.appendChild(style);

  // Preload critical fonts
  const fonts = [
    '/fonts/inter-var.woff2',
    '/fonts/geist-sans.woff2'
  ];

  fonts.forEach(fontUrl => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = fontUrl;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Critical CSS inlining for first paint
export const inlineCriticalCSS = () => {
  const criticalCSS = `
    /* Critical styles to prevent layout shift */
    * {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      font-family: 'Inter Variable', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      font-feature-settings: 'cv11', 'ss01';
      font-variation-settings: 'opsz' 32;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* Prevent layout shift for images */
    img {
      max-width: 100%;
      height: auto;
    }
    
    /* Stable heights for common components */
    .hero-section {
      min-height: 400px;
    }
    
    .card {
      min-height: 200px;
    }
    
    .chart-container {
      min-height: 350px;
    }
    
    /* Loading states to prevent shifts */
    .loading-placeholder {
      background: linear-gradient(90deg, hsl(var(--muted)) 25%, hsla(var(--muted), 0.5) 50%, hsl(var(--muted)) 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);
};

// Font metrics for preventing layout shift
export const fontMetrics = {
  'Inter Variable': {
    ascent: 2728,
    descent: -680,
    lineGap: 0,
    unitsPerEm: 2816,
    xHeight: 1536,
    capHeight: 2048
  },
  'Geist Sans': {
    ascent: 1900,
    descent: -500,
    lineGap: 0,
    unitsPerEm: 1000,
    xHeight: 532,
    capHeight: 700
  }
};

// Calculate font size adjustments to prevent layout shift
export const getFontSizeAdjust = (fontFamily: keyof typeof fontMetrics) => {
  const metrics = fontMetrics[fontFamily];
  if (!metrics) return 1;
  
  const fallbackMetrics = fontMetrics['Inter Variable']; // System font fallback
  return fallbackMetrics.xHeight / metrics.xHeight;
};