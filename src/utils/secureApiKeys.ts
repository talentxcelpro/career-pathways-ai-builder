/**
 * Secure API key management utilities
 * Centralizes API key handling to prevent hardcoded keys in components
 */

// Supabase configuration - centralized
export const SUPABASE_CONFIG = {
  url: "https://dthlgsnakhoftinssokm.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc"
} as const;

// Function to get Supabase configuration securely
export const getSupabaseConfig = () => {
  return SUPABASE_CONFIG;
};

// Validate API key format (basic check)
export const validateApiKey = (key: string): boolean => {
  if (!key || typeof key !== 'string') return false;
  
  // Basic JWT format validation for Supabase keys
  const parts = key.split('.');
  return parts.length === 3;
};

// Security headers for API requests
export const getSecurityHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Cache-Control': 'no-cache, no-store, must-revalidate'
});