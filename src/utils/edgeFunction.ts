
import { supabase } from '@/integrations/supabase/client';

export const checkEdgeFunctionHealth = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No session found for health check');
      return false;
    }

    console.log('Checking Edge Function health...');
    
    // Method 1: Try Supabase client with health check payload
    try {
      console.log('Attempting health check via Supabase client...');
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { healthCheck: true },
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });
      
      if (!error && data?.healthCheck) {
        console.log('Edge Function health check passed (Supabase client):', data);
        return true;
      } else {
        console.log('Supabase client health check failed:', { data, error });
      }
    } catch (clientError) {
      console.log('Supabase client health check failed:', clientError);
    }

    // Method 2: Try direct GET request
    try {
      console.log('Attempting health check via direct GET...');
      const functionUrl = `https://dthlgsnakhoftinssokm.supabase.co/functions/v1/admin-create-user`;

      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Direct GET health check passed:', data);
        return true;
      } else {
        const errorText = await response.text();
        console.error('Direct GET health check failed:', response.status, errorText);
      }
    } catch (fetchError) {
      console.error('Direct fetch health check failed:', fetchError);
    }
    
    return false;
  } catch (error) {
    console.error('Edge function health check failed:', error);
    return false;
  }
};

export const testEdgeFunctionDebug = async (): Promise<any> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No session found');
    }

    console.log('Testing Edge Function debug endpoint...');
    
    const { data, error } = await supabase.functions.invoke('admin-create-user', {
      body: { debug: true },
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error('Debug endpoint test failed:', error);
    throw error;
  }
};
