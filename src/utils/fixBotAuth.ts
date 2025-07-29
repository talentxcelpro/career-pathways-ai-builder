import { supabase } from '@/integrations/supabase/client';

export const fixBotAuthIssues = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('fix-bot-auth');
    
    if (error) {
      console.error('Error fixing bot auth:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Bot auth fix result:', data);
    return data;
  } catch (error) {
    console.error('Failed to call fix-bot-auth function:', error);
    return { success: false, error: 'Failed to fix bot authentication' };
  }
};