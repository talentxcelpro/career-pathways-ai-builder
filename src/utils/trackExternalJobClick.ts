import { supabase } from "@/integrations/supabase/client";

export const trackExternalJobClick = async (
  jobId: string, 
  externalUrl: string, 
  sourcePage: string = 'application_success'
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user found for tracking external job click');
      return;
    }

    // Track redirect with console log for now - will be replaced with DB call once types sync
    console.log(`🔗 External redirect tracked: ${jobId} → ${externalUrl} from ${sourcePage}`);
    
    // Store in localStorage as backup tracking until DB types are updated
    const trackingData = {
      jobId,
      externalUrl,
      sourcePage,
      userId: user.id,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    try {
      const existingData = JSON.parse(localStorage.getItem('external_redirects') || '[]');
      existingData.push(trackingData);
      localStorage.setItem('external_redirects', JSON.stringify(existingData.slice(-100))); // Keep last 100
    } catch (storageError) {
      console.warn('Failed to store redirect in localStorage:', storageError);
    }

  } catch (error) {
    console.error('Failed to track external job redirect:', error);
  }
};