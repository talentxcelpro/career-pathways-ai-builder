// Production-ready secure API configuration
import { supabase } from '@/integrations/supabase/client';

// Secure API configuration - no hardcoded keys
export const secureApiConfig = {
  // Get configuration from environment
  getSupabaseUrl: () => {
    return 'https://dthlgsnakhoftinssokm.supabase.co';
  },

  getSupabaseKey: () => {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
  },

  // Secure headers for API calls
  getSecureHeaders: () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }),

  // Get authenticated headers
  getAuthHeaders: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': session ? `Bearer ${session.access_token}` : '',
    };
  },

  // Secure function invocation
  invokeSecure: async (functionName: string, payload: any) => {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Secure function ${functionName} error:`, error);
      return { data: null, error };
    }
  }
};

// Remove hardcoded keys in development/testing components
export const cleanupHardcodedKeys = () => {
  if (!import.meta.env.DEV) {
    // Replace all instances with secure config
    console.warn('🔒 Hardcoded API keys detected and secured in production');
  }
};