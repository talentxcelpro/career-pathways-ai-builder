// Environment utilities for production-ready configuration
import { APP_CONFIG } from '@/config/constants';

export const ENV = {
  // Environment detection
  isDevelopment: APP_CONFIG.FEATURES.DEVELOPMENT_MODE,
  isProduction: !APP_CONFIG.FEATURES.DEVELOPMENT_MODE,
  
  // Supabase
  supabaseUrl: APP_CONFIG.SUPABASE_URL,
  supabaseAnonKey: APP_CONFIG.SUPABASE_ANON_KEY,
  
  // URLs
  functionsUrl: APP_CONFIG.FUNCTIONS_URL,
  siteUrl: APP_CONFIG.SITE_URL,
  
  // Feature flags
  enableTestingTools: APP_CONFIG.FEATURES.TESTING_TOOLS,
  enableAdminDebug: APP_CONFIG.FEATURES.ADMIN_DEBUG,
} as const;

// Type-safe environment checker
export const checkEnvironment = () => {
  const missing: string[] = [];
  
  if (!ENV.supabaseUrl) missing.push('SUPABASE_URL');
  if (!ENV.supabaseAnonKey) missing.push('SUPABASE_ANON_KEY');
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return true;
};

// Safe environment variable getter
export const getEnvVar = (key: keyof typeof ENV, fallback?: string) => {
  const value = ENV[key];
  if (value === undefined && fallback === undefined) {
    console.warn(`Environment variable ${key} is undefined and no fallback provided`);
  }
  return value ?? fallback;
};

// Development-only utilities
export const devOnly = <T>(fn: () => T): T | null => {
  return ENV.isDevelopment ? fn() : null;
};

export const prodOnly = <T>(fn: () => T): T | null => {
  return ENV.isProduction ? fn() : null;
};