// Production-ready configuration constants
// This file centralizes all environment variables and constants

export const APP_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: "https://dthlgsnakhoftinssokm.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc",
  
  // Application URLs
  FUNCTIONS_URL: "https://dthlgsnakhoftinssokm.supabase.co/functions/v1",
  SITE_URL: "https://talentxcel.in",
  
  // TXC Token Configuration
  TXC_USD_RATE: 0.02, // 1 TXC = $0.02 USD
  TXC_EXCHANGE_LAUNCH: "Q2 2026",
  
  // Feature Flags
  FEATURES: {
    DEVELOPMENT_MODE: import.meta.env?.DEV || false,
    TESTING_TOOLS: import.meta.env?.DEV || false,
    ADMIN_DEBUG: import.meta.env?.DEV || false,
  },
  
  // API Configuration
  API: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    CACHE_DURATION: 300000, // 5 minutes
  },
  
  // Performance Thresholds
  PERFORMANCE: {
    MAX_RENDER_TIME: 16, // milliseconds
    MAX_API_RESPONSE_TIME: 5000, // milliseconds
    LAZY_LOAD_THRESHOLD: 100, // pixels
  }
};

// Helper functions
export const getSupabaseConfig = () => ({
  url: APP_CONFIG.SUPABASE_URL,
  anonKey: APP_CONFIG.SUPABASE_ANON_KEY,
});

export const getFunctionUrl = (functionName: string) => 
  `${APP_CONFIG.FUNCTIONS_URL}/${functionName}`;

export const isDevelopment = () => APP_CONFIG.FEATURES.DEVELOPMENT_MODE;
export const isProduction = () => !APP_CONFIG.FEATURES.DEVELOPMENT_MODE;

// TXC Utilities
export const formatTXCToUSD = (txcAmount: number) => {
  const usdValue = txcAmount * APP_CONFIG.TXC_USD_RATE;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(usdValue);
};