import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCareerPassport } from '@/hooks/useCareerPassport';
import { useProfile } from '@/hooks/useProfile';
import { useUserScores } from '@/hooks/useUserScores';
import { useRealCareerData } from '@/hooks/useRealCareerData';
import { EnhancedCareerPassport } from '@/components/passport/EnhancedCareerPassport';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { CareerReadinessCard } from '@/components/gamification/CareerReadinessCard';
import { UserBadges } from '@/components/gamification/UserBadges';
import { QRCodeGenerator } from '@/components/passport/QRCodeGenerator';
import { 
  QrCode, 
  Share2, 
  Download, 
  ExternalLink, 
  Copy,
  CheckCircle,
  AlertTriangle,
  Zap,
  TrendingUp,
  Users,
  Award,
  Briefcase,
  FileText,
  Shield,
  ArrowRight,
  Plus,
  Trophy,
  Target,
  MoreHorizontal,
  UserPlus,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface CareerPassportData {
  profile?: any;
  passport?: any;
  completion?: any;
  publicProfile?: any;
  analytics?: any;
}

export function CareerPassportDashboard() {
  const { userId, username } = useParams<{ userId?: string; username?: string }>();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { careerPassport, achievements, isLoading, getCompletionBreakdown, getNextMilestone, trackJourneyEvent, updateCareerPassport } = useCareerPassport();
  const { data: userScores } = useUserScores(userId || user?.id);
  const navigate = useNavigate();
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [publicProfile, setPublicProfile] = useState<any>(null);
  const [publicPassportData, setPublicPassportData] = useState<any>(null);
  const [isPublicView, setIsPublicView] = useState(false);
  const [publicLoading, setPublicLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const initializeView = async () => {
      // Check if viewing someone else's passport (public view)
      if (userId && userId !== user?.id) {
        setIsPublicView(true);
        await loadPublicPassportData(userId);
        if (user?.id) {
          await checkConnectionStatus(userId);
        }
      } else if (user?.id) {
        // Load own profile data
        setIsPublicView(false);
        await loadPublicProfile();
      }
    };

    const checkConnectionStatus = async (targetUserId: string) => {
      if (!user?.id) return;
      
      try {
        const { data } = await supabase
          .from('connections')
          .select('status')
          .or(`and(requester_id.eq.${user.id},recipient_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},recipient_id.eq.${user.id})`)
          .single();
        
        if (data) {
          setConnectionStatus(data.status);
        }
      } catch (error) {
        console.error('Error checking connection status:', error);
      }
    };

    const loadPublicProfile = async () => {
      try {
        const { data } = await supabase
          .from('public_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          setPublicProfile(data);
        }
      } catch (error) {
        console.error('Error loading public profile:', error);
      }
    };

    const loadPublicPassportData = async (targetUserId: string) => {
      setPublicLoading(true);
      try {
        // Fetch public profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, headline, location, profile_picture_url, talentxcel_id')
          .eq('id', targetUserId)
          .single();

        // Fetch public career passport data
        const { data: passportData } = await supabase
          .from('career_passport')
          .select('completion_percentage, career_readiness_score, market_competitiveness_score, resumes_count, jobs_applied_count, certifications_count, connections_count')
          .eq('user_id', targetUserId)
          .single();

        // Fetch public achievements
        const { data: achievementsData } = await supabase
          .from('career_achievements')
          .select('achievement_type, achievement_title, achievement_description, points_awarded, earned_at')
          .eq('user_id', targetUserId)
          .eq('is_public', true)
          .limit(5);

        setPublicPassportData({
          profile: profileData,
          passport: passportData,
          achievements: achievementsData || []
        });
      } catch (error) {
        console.error('Error loading public passport:', error);
      } finally {
        setPublicLoading(false);
      }
    };

    initializeView();
  }, [userId, user?.id]);

  // Set QR code URL when public profile is updated
  useEffect(() => {
    if (publicProfile?.qr_code_data) {
      setQrCodeUrl(publicProfile.qr_code_data);
    }
  }, [publicProfile]);

  const generateQRCode = async () => {
    if (!user?.id) return;

    setIsGeneratingQR(true);
    try {
      const { data, error } = await supabase.functions.invoke('qr-generator', {
        body: { 
          userId: user.id
        }
      });

      if (error) throw error;

      if (data?.qrCodeData) {
        setPublicProfile({
          qr_code_data: data.qrCodeData,
          public_url: data.publicUrl,
          is_active: true
        });
        toast.success('QR code generated successfully!');
      } else if (data?.publicUrl) {
        // Fallback: generate QR on client if function returned URL but no image
        const fallbackDataUrl = await QRCode.toDataURL(data.publicUrl, { width: 320, margin: 2 });
        setPublicProfile({
          qr_code_data: fallbackDataUrl,
          public_url: data.publicUrl,
          is_active: true
        });
        toast.success('QR code generated (client)');
      } else if (data?.success) {
        // Edge case success with no data
        const publicUrl = `https://talentxcel.in/passport/${encodeURIComponent(user.id)}`;
        const fallbackDataUrl = await QRCode.toDataURL(publicUrl, { width: 320, margin: 2 });
        setPublicProfile({
          qr_code_data: fallbackDataUrl,
          public_url: publicUrl,
          is_active: true
        });
        toast.success('QR code generated (client)');
      } else {
        // Try client-side as final fallback
        const publicUrl = `https://talentxcel.in/passport/${encodeURIComponent(user.id)}`;
        const fallbackDataUrl = await QRCode.toDataURL(publicUrl, { width: 320, margin: 2 });
        setPublicProfile({
          qr_code_data: fallbackDataUrl,
          public_url: publicUrl,
          is_active: true
        });
        toast.success('QR code generated (client)');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      try {
        const publicUrl = `https://talentxcel.in/passport/${encodeURIComponent(user.id)}`;
        const fallbackDataUrl = await QRCode.toDataURL(publicUrl, { width: 320, margin: 2 });
        setPublicProfile({
          qr_code_data: fallbackDataUrl,
          public_url: publicUrl,
          is_active: true
        });
        toast.success('QR code generated (client fallback)');
      } catch (clientErr) {
        console.error('Client QR fallback failed:', clientErr);
        toast.error('Failed to generate QR code');
      }
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const copyPublicUrl = () => {
    if (publicProfile?.public_url) {
      navigator.clipboard.writeText(publicProfile.public_url);
      toast.success('Public URL copied to clipboard!');
    }
  };

  // Quick Action Handlers
  const handleCompleteProfile = async () => {
    if (!isPublicView) {
      try {
        trackJourneyEvent.mutate({
          eventType: 'profile_action',
          eventModule: 'complete_profile',
          eventData: { current_completion: 0 }
        });
        navigate('/profile/edit');
        toast.success('Redirecting to complete profile...');
      } catch (error) {
        console.error('Error tracking profile completion:', error);
        navigate('/profile/edit');
      }
    }
  };

  const handleSendConnectionRequest = async () => {
    if (!userId || userId === user?.id) return;
    
    try {
      const { error } = await supabase
        .from('connections')
        .insert([{
          requester_id: user?.id,
          recipient_id: userId,
          status: 'pending'
        }]);

      if (error) throw error;
      
      toast.success('Connection request sent!');
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    }
  };

  const handleShareProfile = () => {
    const shareUrl = `https://talentxcel.in/passport/${userId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Profile link copied to clipboard!');
  };

  // Get user data for display (public or private)
  const getDisplayData = () => {
    if (isPublicView && publicPassportData) {
      return {
        profile: publicPassportData.profile,
        passport: publicPassportData.passport,
        achievements: publicPassportData.achievements,
        isOwner: false
      };
    }
    return {
      profile: { 
        full_name: user?.user_metadata?.full_name || profile?.full_name,
        headline: profile?.headline,
        location: profile?.location,
        profile_picture_url: user?.user_metadata?.avatar_url || profile?.profile_picture_url,
        talentxcel_id: profile?.talentxcel_id
      },
      passport: careerPassport,
      achievements: achievements,
      isOwner: true
    };
  };

  const displayData = getDisplayData();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Show sign-in prompt for unauthenticated users */}
        {!user && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">
              Sign In Required
            </h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your career passport.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {(isLoading || publicLoading) ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : displayData.profile ? (
          <EnhancedCareerPassport 
            userId={userId || user?.id}
            userProfile={displayData.profile}
            isOwner={displayData.isOwner}
            publicPassport={isPublicView ? publicPassportData : undefined}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">
              Career Passport Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              This user hasn't set up their career passport yet.
            </p>
            {displayData.isOwner && (
              <Button onClick={handleCompleteProfile}>
                Complete Your Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CareerPassportDashboard;