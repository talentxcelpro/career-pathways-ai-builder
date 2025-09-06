import { useCallback } from 'react';
import { toast } from 'sonner';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

interface SharePostData {
  content: string;
  mediaUrls?: string[];
  authorName?: string;
  profileUrl?: string;
}

export const useNativeShare = () => {
  const canShare = useCallback((data: ShareData = {}) => {
    return typeof navigator !== 'undefined' && 
           'share' in navigator && 
           (typeof navigator.canShare === 'undefined' || navigator.canShare(data));
  }, []);

  const share = useCallback(async (data: ShareData) => {
    if (!canShare(data)) {
      throw new Error('Web Share API not supported');
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User cancelled the share
        return false;
      }
      throw error;
    }
  }, [canShare]);

  const sharePost = useCallback(async (postData: SharePostData) => {
    const shareText = postData.content.length > 200 
      ? `${postData.content.substring(0, 200)}...` 
      : postData.content;
    
    const shareUrl = postData.profileUrl || window.location.origin;
    
    const shareDataBase = {
      title: `Check out this post${postData.authorName ? ` by ${postData.authorName}` : ''}`,
      text: shareText,
      url: shareUrl
    };

    // If there are media URLs, try to fetch and include the first image
    if (postData.mediaUrls && postData.mediaUrls.length > 0) {
      try {
        const firstImageUrl = postData.mediaUrls.find(url => 
          /\.(jpg|jpeg|png|gif|webp)(\?|#|$)/i.test(url)
        );
        
        if (firstImageUrl && canShare({ ...shareDataBase, files: [] })) {
          // Try to fetch the image as a File
          const response = await fetch(firstImageUrl);
          const blob = await response.blob();
          const fileName = firstImageUrl.split('/').pop() || 'image.jpg';
          const file = new File([blob], fileName, { type: blob.type });
          
          return await share({
            ...shareDataBase,
            files: [file]
          });
        }
      } catch (error) {
        console.warn('Failed to include image in share:', error);
        // Fallback to text-only share
      }
    }

    // Standard text/URL share
    return await share(shareDataBase);
  }, [share, canShare]);

  const copyToClipboard = useCallback(async (text: string) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
        return true;
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
    
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (result) {
        toast.success('Copied to clipboard!');
        return true;
      }
    } catch (error) {
      console.error('Fallback copy failed:', error);
    }
    
    toast.error('Failed to copy to clipboard');
    return false;
  }, []);

  const sharePostWithFallback = useCallback(async (postData: SharePostData) => {
    if (canShare()) {
      try {
        const success = await sharePost(postData);
        if (success) {
          toast.success('Post shared successfully!');
          return true;
        }
        return false; // User cancelled
      } catch (error) {
        console.error('Native share failed:', error);
      }
    }
    
    // Fallback to copy URL/text
    const fallbackText = `${postData.content}\n\n${postData.profileUrl || window.location.origin}`;
    return await copyToClipboard(fallbackText);
  }, [canShare, sharePost, copyToClipboard]);

  return {
    canShare,
    share,
    sharePost,
    sharePostWithFallback,
    copyToClipboard
  };
};