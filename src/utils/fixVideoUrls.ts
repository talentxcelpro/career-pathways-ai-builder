// Utility to call the fix-video-urls edge function as a backup
import { supabase } from '@/integrations/supabase/client';

export const callFixVideoUrlsFunction = async () => {
  try {
    console.log('🔧 Calling fix-video-urls edge function...');
    
    const { data, error } = await supabase.functions.invoke('fix-video-urls');
    
    if (error) {
      console.error('❌ Edge function error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Edge function response:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Failed to call edge function:', error);
    return { success: false, error: error.message };
  }
};