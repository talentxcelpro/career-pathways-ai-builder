import { supabase } from '@/integrations/supabase/client';

export const checkEdgeFunctionHealth = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No session found for health check');
      return false;
    }

    console.log('Checking Edge Function health...');
    
    // Try Supabase client first
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { healthCheck: true },
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });
      
      if (!error) {
        console.log('Edge Function health check passed (Supabase client)');
        return true;
      }
    } catch (clientError) {
      console.log('Supabase client health check failed, trying direct fetch');
    }

    // Fallback to direct fetch
    const functionUrl = `https://dthlgsnakhoftinssokm.supabase.co/functions/v1/admin-create-user`;

    const response = await fetch(functionUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
        'Content-Type': 'application/json',
      }
    });

    const isHealthy = response.ok;
    console.log(`Edge Function health check: ${isHealthy ? 'PASS' : 'FAIL'} (${response.status})`);
    
    if (!isHealthy) {
      const errorText = await response.text();
      console.error('Health check error:', errorText);
    }
    
    return isHealthy;
  } catch (error) {
    console.error('Edge function health check failed:', error);
    return false;
  }
};