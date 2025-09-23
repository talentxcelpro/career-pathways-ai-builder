// Known broken video IDs that should be flagged immediately
const KNOWN_BROKEN_VIDEO_IDS = [
  'rfscVS0vtbw',
  'llKvV8_T95M', 
  'bFOKONpVDAQ',
  'ByYP60zz3F4',
  'dQw4w9WgXcQ'
];

export const validateVideoUrl = async (url: string): Promise<{ isValid: boolean; reason?: string }> => {
  if (!url || !url.trim()) return { isValid: false, reason: 'Empty URL' };
  
  try {
    // Basic URL validation
    new URL(url);
    
    // Check for known broken video IDs
    const hasKnownBrokenId = KNOWN_BROKEN_VIDEO_IDS.some(id => url.includes(id));
    if (hasKnownBrokenId) {
      return { isValid: false, reason: 'Known broken video ID detected' };
    }
    
    // Enhanced YouTube validation
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
      try {
        const videoId = extractYouTubeVideoId(url);
        if (!videoId) {
          return { isValid: false, reason: 'Invalid YouTube URL format' };
        }
        
        // Actually check if the video exists by trying to fetch its embed page
        try {
          const embedUrl = `https://www.youtube.com/embed/${videoId}`;
          const response = await fetch(embedUrl, { 
            method: 'HEAD',
            mode: 'no-cors' // Avoid CORS issues
          });
          // If we get here without error, the video likely exists
          return { isValid: true };
        } catch (embedError) {
          // If embed fails, try oEmbed API as fallback
          try {
            const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            const oEmbedResponse = await fetch(oEmbedUrl);
            if (oEmbedResponse.ok) {
              return { isValid: true };
            } else {
              return { isValid: false, reason: 'Video not found or unavailable' };
            }
          } catch (oEmbedError) {
            return { isValid: false, reason: 'Unable to verify video availability' };
          }
        }
      } catch (error) {
        return { isValid: false, reason: 'YouTube URL validation failed' };
      }
    }
    
    // For Supabase storage URLs, try a HEAD request to check if file exists
    if (url.includes('supabase.co/storage')) {
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          mode: 'no-cors' // Avoid CORS issues
        });
        // If we get here without error, assume the URL is valid
        return { isValid: true };
      } catch (error) {
        console.warn('Video validation failed for:', url, error);
        return { isValid: false, reason: 'Supabase storage file not accessible' };
      }
    }
    
    // For other URLs, basic validation
    const hasValidExtension = url.match(/\.(mp4|mov|webm|avi|m4v)(\?|#|$)/i) !== null;
    return { isValid: hasValidExtension, reason: hasValidExtension ? undefined : 'Invalid video file extension' };
  } catch (error) {
    console.warn('Invalid video URL:', url, error);
    return { isValid: false, reason: 'Invalid URL format' };
  }
};

export const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const validateVideoUrls = async (urls: string[]): Promise<{ valid: string[]; invalid: Array<{ url: string; reason: string }> }> => {
  const valid: string[] = [];
  const invalid: Array<{ url: string; reason: string }> = [];
  
  for (const url of urls) {
    const result = await validateVideoUrl(url);
    if (result.isValid) {
      valid.push(url);
    } else {
      invalid.push({ url, reason: result.reason || 'Unknown error' });
    }
  }
  
  return { valid, invalid };
};

export const scanCourseVideos = async (): Promise<{
  totalVideos: number;
  brokenVideos: Array<{ id: string; title: string; video_url: string; reason: string }>;
  validVideos: number;
}> => {
  try {
    const { data: lessons, error } = await supabase
      .from('course_lessons')
      .select(`
        id,
        title,
        video_url,
        course_modules!inner (
          courses!inner (
            title
          )
        )
      `);

    if (error) throw error;

    const brokenVideos: Array<{ id: string; title: string; video_url: string; reason: string }> = [];
    let validVideos = 0;

    for (const lesson of lessons || []) {
      if (lesson.video_url) {
        const result = await validateVideoUrl(lesson.video_url);
        if (!result.isValid) {
          brokenVideos.push({
            id: lesson.id,
            title: lesson.title,
            video_url: lesson.video_url,
            reason: result.reason || 'Unknown error'
          });
        } else {
          validVideos++;
        }
      }
    }

    return {
      totalVideos: lessons?.length || 0,
      brokenVideos,
      validVideos
    };
  } catch (error) {
    console.error('Failed to scan course videos:', error);
    return { totalVideos: 0, brokenVideos: [], validVideos: 0 };
  }
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

// Add missing import for supabase client
import { supabase } from '@/integrations/supabase/client';