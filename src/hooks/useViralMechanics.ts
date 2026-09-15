import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ReferralData {
  referral_code: string;
  referrals_count: number;
  successful_conversions: number;
  rewards_earned: number;
}

interface ShareData {
  platform: 'twitter' | 'linkedin' | 'whatsapp' | 'email' | 'copy';
  contentId: string;
  contentType: 'post' | 'job' | 'profile' | 'reel';
}

export const useViralMechanics = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSharing, setIsSharing] = useState(false);

  // Fetch user's referral data
  const { data: referralData, isLoading } = useQuery({
    queryKey: ['referral-data', user?.id],
    queryFn: async () => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from('user_referrals')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error || !data) {
          const code = `${user.id.slice(0, 8).toUpperCase()}`;
          return {
            referral_code: code,
            referrals_count: 0,
            successful_conversions: 0,
            rewards_earned: 0
          } as ReferralData;
        }

        return data as ReferralData;
      } catch {
        const code = `${user.id.slice(0, 8).toUpperCase()}`;
        return {
          referral_code: code,
          referrals_count: 0,
          successful_conversions: 0,
          rewards_earned: 0
        } as ReferralData;
      }
    },
    enabled: !!user
  });

  // Generate shareable link
  const generateShareLink = useCallback((contentType: string, contentId: string): string => {
    const baseUrl = window.location.origin;
    const referralCode = referralData?.referral_code || '';
    return `${baseUrl}/${contentType}/${contentId}?ref=${referralCode}`;
  }, [referralData]);

  // Share content mutation
  const shareMutation = useMutation({
    mutationFn: async ({ platform, contentId, contentType }: ShareData) => {
      if (!user) throw new Error('User not authenticated');

      const shareUrl = generateShareLink(contentType, contentId);
      const shareTitle = `Check this out on TalentXcel!`;

      // Track share event
      await supabase.from('viral_shares').insert({
        user_id: user.id,
        content_id: contentId,
        content_type: contentType,
        platform,
        share_url: shareUrl
      });

      // Platform-specific sharing
      switch (platform) {
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`, '_blank');
          break;
        case 'email':
          window.location.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`;
          break;
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard!');
          break;
      }

      return { platform, shareUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viral-shares'] });
      toast.success('Share tracked! Earn rewards when friends engage.');
    },
    onError: (error) => {
      console.error('Share error:', error);
      toast.error('Failed to track share');
    }
  });

  // Track referral conversion
  const trackConversion = useCallback(async (referralCode: string) => {
    if (!user || !referralCode) return;

    try {
      // Find referrer
      const { data: referrer } = await supabase
        .from('user_referrals')
        .select('user_id')
        .eq('referral_code', referralCode)
        .single();

      if (!referrer) return;

      // Record conversion
      await supabase.from('referral_conversions').insert({
        referrer_id: referrer.user_id,
        referred_user_id: user.id,
        referral_code: referralCode,
        conversion_type: 'signup'
      });

      // Update referrer stats
      await supabase.rpc('increment_referral_count', {
        user_id: referrer.user_id
      });

      toast.success('🎉 Welcome! Your referrer earned a bonus!');
    } catch (error) {
      console.error('Conversion tracking error:', error);
    }
  }, [user]);

  // Generate viral copy
  const generateViralCopy = useCallback((contentType: string): string => {
    const templates = {
      post: [
        "🔥 Just discovered this on TalentXcel!",
        "💡 This is worth your time",
        "🚀 Game-changer content alert!"
      ],
      job: [
        "🎯 Dream job alert!",
        "💼 Perfect opportunity here",
        "🌟 This role is incredible"
      ],
      profile: [
        "👋 Connect with this amazing professional",
        "🤝 You should meet this person",
        "⭐ Impressive profile to check out"
      ],
      reel: [
        "🎬 Must-watch content!",
        "📹 This is pure gold",
        "✨ You won't regret watching this"
      ]
    };

    const options = templates[contentType as keyof typeof templates] || templates.post;
    return options[Math.floor(Math.random() * options.length)];
  }, []);

  return {
    referralData,
    isLoading,
    shareContent: shareMutation.mutate,
    isSharing: shareMutation.isPending,
    generateShareLink,
    trackConversion,
    generateViralCopy,
    referralUrl: referralData ? `${window.location.origin}?ref=${referralData.referral_code}` : ''
  };
};
