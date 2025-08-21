export const validateVideoUrl = async (url: string): Promise<boolean> => {
  if (!url || !url.trim()) return false;
  
  try {
    // Basic URL validation
    new URL(url);
    
    // Skip validation for external videos (YouTube, etc.) - assume they work
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
      return true;
    }
    
    // For Supabase storage URLs, try a HEAD request to check if file exists
    if (url.includes('supabase.co/storage')) {
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          mode: 'no-cors' // Avoid CORS issues
        });
        // If we get here without error, assume the URL is valid
        return true;
      } catch (error) {
        console.warn('Video validation failed for:', url, error);
        return false;
      }
    }
    
    // For other URLs, basic validation
    return url.match(/\.(mp4|mov|webm|avi|m4v)(\?|#|$)/i) !== null;
  } catch (error) {
    console.warn('Invalid video URL:', url, error);
    return false;
  }
};

export const validateVideoUrls = async (urls: string[]): Promise<string[]> => {
  const validUrls: string[] = [];
  
  for (const url of urls) {
    if (await validateVideoUrl(url)) {
      validUrls.push(url);
    }
  }
  
  return validUrls;
};

export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  return (
    /\.(mp4|mov|webm|avi|m4v)(\?|#|$)/i.test(url) ||
    url.includes('post-media') ||
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com')
  );
};