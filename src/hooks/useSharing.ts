import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DOMAIN_CONFIG } from '@/config/domain';

export interface ShareTrackingData {
  contentType: 'post' | 'job' | 'company' | 'college' | 'article' | 'profile';
  contentId: string;
  platform: string;
  shareUrl: string;
  referrer?: string;
}

export const useSharing = () => {
  const [isTracking, setIsTracking] = useState(false);
  const { toast } = useToast();

  const trackShare = async (data: ShareTrackingData) => {
    try {
      setIsTracking(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.rpc('track_share_analytics', {
        p_content_type: data.contentType,
        p_content_id: data.contentId,
        p_platform: data.platform,
        p_share_url: data.shareUrl,
        p_shared_by: user?.id || null,
        p_referrer: data.referrer || document.referrer,
        p_user_agent: navigator.userAgent
      });

      if (error) {
        console.error('Error tracking share:', error);
      }
    } catch (error) {
      console.error('Error tracking share:', error);
    } finally {
      setIsTracking(false);
    }
  };

  const generatePublicUrl = (contentType: string, contentId: string, slug?: string) => {
    const baseUrl = DOMAIN_CONFIG.getBaseUrl();
    
    const pathMap = {
      post: `/p/post/${contentId}`,
      job: `/p/job/${contentId}`,
      company: `/p/company/${contentId}`,
      college: `/p/college/${contentId}`,
      article: `/p/article/${contentId}`,
      profile: `/p/profile/${contentId}`
    };
    
    return `${baseUrl}${pathMap[contentType as keyof typeof pathMap] || '/'}`;
  };

  const shareToSocialMedia = async (
    platform: string,
    shareUrl: string,
    message?: string
  ) => {
    const platformUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message || shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message || '')}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message || '')}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      email: `mailto:?subject=${encodeURIComponent('Check this out from TalentXcel')}&body=${encodeURIComponent(message || shareUrl)}`,
      copy: shareUrl
    };

    const platformUrl = platformUrls[platform as keyof typeof platformUrls];
    
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "The link has been copied to your clipboard.",
        });
        return true;
      } catch (error) {
        toast({
          title: "Copy failed",
          description: "Unable to copy link to clipboard.",
          variant: "destructive"
        });
        return false;
      }
    } else if (platformUrl) {
      window.open(platformUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
      return true;
    }
    
    return false;
  };

  return {
    trackShare,
    generatePublicUrl,
    shareToSocialMedia,
    isTracking
  };
};