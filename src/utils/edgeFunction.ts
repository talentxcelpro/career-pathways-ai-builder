import { supabase } from '@/integrations/supabase/client';

export const checkEdgeFunctionHealth = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const functionUrl = `https://dthlgsnakhofinssokm.supabase.co/functions/v1/admin-create-user`;

    const response = await fetch(functionUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Edge function health check failed:', error);
    return false;
  }
};