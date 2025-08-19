import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCareerPassport } from '@/hooks/useCareerPassport';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthDialog } from '@/components/auth/AuthDialog';
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
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { careerPassport, achievements, isLoading, getCompletionBreakdown, getNextMilestone, trackJourneyEvent, updateCareerPassport } = useCareerPassport();
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

  // Progress Journey Levels
  const getProgressLevel = (percentage: number) => {
    if (percentage < 25) return { level: 'Beginner', color: 'bg-gray-400', next: 'Intermediate' };
    if (percentage < 50) return { level: 'Intermediate', color: 'bg-blue-400', next: 'Advanced' };
    if (percentage < 75) return { level: 'Advanced', color: 'bg-green-400', next: 'Expert' };
    return { level: 'Expert', color: 'bg-purple-400', next: 'Master' };
  };

  // Peer Comparison Data
  const getPeerComparison = () => {
    const score = getMarketCompetitiveness();
    const title = displayData.profile?.headline || 'Professional';
    const location = displayData.profile?.location || 'Global';
    
    if (score === 0) return null;
    
    const percentile = Math.max(5, Math.min(95, score + Math.random() * 20 - 10));
    return {
      percentile: Math.round(percentile),
      title: title.split(' ')[0] || 'Professionals',
      location
    };
  };

  // Get Next Action Steps
  const getActionSteps = () => {
    const steps = [];
    const completion = getCompletionBreakdown();
    
    if (!completion) return [];
    
    if (completion.profile < 40) {
      steps.push({ icon: UserPlus, text: 'Complete your profile', priority: 'high', action: handleCompleteProfile });
    }
    if (completion.resumes < 25) {
      steps.push({ icon: FileText, text: 'Create your first resume', priority: 'high', action: handleCreateResume });
    }
    if (displayData.passport?.certifications_count === 0) {
      steps.push({ icon: Award, text: 'Earn a certification', priority: 'medium', action: handleGetCertified });
    }
    if (displayData.passport?.connections_count < 10) {
      steps.push({ icon: Users, text: 'Build your network', priority: 'medium', action: handleBuildNetwork });
    }
    if (displayData.passport?.jobs_applied_count === 0) {
      steps.push({ icon: Briefcase, text: 'Apply for jobs', priority: 'low', action: handleApplyJobs });
    }
    
    return steps.slice(0, 3); // Show max 3 steps
  };

  // Share Career Passport
  const shareCareerPassport = async () => {
    const shareUrl = publicProfile?.public_url || `https://talentxcel.in/passport/${user?.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayData.profile?.full_name}'s Career Passport`,
          text: 'Check out my professional career passport on TalentXcel',
          url: shareUrl
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
        toast.success('Career Passport link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Career Passport link copied to clipboard!');
    }
  };

  // Quick Action Handlers
  const handleAddWorkExperience = async () => {
    if (!displayData.isOwner) {
      toast.error('Please sign in to add work experience');
      return;
    }
    
    try {
      trackJourneyEvent.mutate({
        eventType: 'profile_action',
        eventModule: 'work_experience',
        eventData: { action: 'add_experience_clicked' }
      });
      navigate('/profile/edit?section=experience');
      toast.success('Redirecting to add work experience...');
    } catch (error) {
      console.error('Error tracking experience action:', error);
      navigate('/profile/edit?section=experience');
    }
  };

  const handleGetCertified = async () => {
    if (!displayData.isOwner) {
      toast.error('Please sign in to access certifications');
      return;
    }
    
    try {
      trackJourneyEvent.mutate({
        eventType: 'learning_action',
        eventModule: 'certifications',
        eventData: { action: 'get_certified_clicked' }
      });
      navigate('/learning');
      toast.success('Redirecting to learning hub...');
    } catch (error) {
      console.error('Error tracking certification action:', error);
      navigate('/learning');
    }
  };

  const handleBuildNetwork = async () => {
    if (!displayData.isOwner) {
      toast.error('Please sign in to build your network');
      return;
    }
    
    try {
      trackJourneyEvent.mutate({
        eventType: 'network_action',
        eventModule: 'connections',
        eventData: { action: 'build_network_clicked' }
      });
      navigate('/network');
      toast.success('Redirecting to network...');
    } catch (error) {
      console.error('Error tracking network action:', error);
      navigate('/network');
    }
  };

  const handleCompleteProfile = async () => {
    if (!displayData.isOwner) {
      toast.error('Please sign in to complete profile');
      return;
    }
    
    try {
      trackJourneyEvent.mutate({
        eventType: 'profile_action',
        eventModule: 'complete_profile',
        eventData: { current_completion: getCompletionPercentage() }
      });
      navigate('/profile/edit');
      toast.success('Redirecting to complete profile...');
    } catch (error) {
      console.error('Error tracking profile completion:', error);
      navigate('/profile/edit');
    }
  };

  const handleCreateResume = async () => {
    if (!displayData.isOwner) {
      toast.error('Please sign in to create resume');
      return;
    }
    
    try {
      trackJourneyEvent.mutate({
        eventType: 'resume_action',
        eventModule: 'create_resume',
        eventData: { action: 'create_resume_clicked' }
      });
      navigate('/resume/new');
      toast.success('Redirecting to resume builder...');
    } catch (error) {
      console.error('Error tracking resume action:', error);
      navigate('/resume/new');
    }
  };

  const handleApplyJobs = async () => {
    if (!displayData.isOwner) {
      toast.error('Please sign in to apply for jobs');
      return;
    }
    
    try {
      trackJourneyEvent.mutate({
        eventType: 'job_action',
        eventModule: 'apply_jobs',
        eventData: { action: 'apply_jobs_clicked' }
      });
      navigate('/jobs');
      toast.success('Redirecting to job board...');
    } catch (error) {
      console.error('Error tracking job application action:', error);
      navigate('/jobs');
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

  const completion = getCompletionBreakdown();
  const nextMilestone = getNextMilestone();

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

  // Function to get profile picture URL - ONLY REAL USER DATA
  const getProfilePictureUrl = () => {
    const userUploadedImage = displayData.profile?.profile_picture_url;
    const googleImage = user?.user_metadata?.avatar_url;
    
    // Priority 1: User uploaded image from profile
    if (userUploadedImage) return userUploadedImage;
    
    // Priority 2: Google profile image (fallback only)
    if (googleImage) return googleImage;
    
    // No photo available - don't show avatar at all
    return null;
  };

  // Check if user needs to be prompted for photo
  const needsPhotoPrompt = () => {
    return displayData.isOwner && 
           !displayData.profile?.profile_picture_url && 
           !user?.user_metadata?.avatar_url;
  };

  const getUserInitials = () => {
    const name = displayData.profile?.full_name;
    if (!name) return 'U';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  const getCompletionPercentage = () => displayData.passport?.completion_percentage || 0;
  const getCareerReadiness = () => displayData.passport?.career_readiness_score || 0;
  const getMarketCompetitiveness = () => displayData.passport?.market_competitiveness_score || 0;
  const getDisplayName = () => displayData.profile?.full_name?.split(' ')[0] || 'User';
  
  // Generate TalentXcel ID in the format from screenshot
  const getTalentXcelId = () => {
    const id = displayData.profile?.talentxcel_id;
    if (id) return id;
    
    // Generate ID like ARS315116 from user ID or create fallback
    const userId = user?.id || 'default';
    const letters = userId.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'A');
    const numbers = userId.slice(-6).replace(/[^0-9]/g, '0').padStart(6, '0');
    return `${letters}${numbers}`;
  };

  // Show authentication prompt for unauthenticated users viewing public profiles
  if (!user && isPublicView) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mb-6">
              <Award className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Join TalentXcel to Connect
              </h2>
              <p className="text-muted-foreground mb-6">
                Sign up to view full career passports and connect with professionals in your network
              </p>
            </div>
            <div className="space-y-3">
              <AuthDialog buttonText="Sign Up to Connect" variant="default">
                <Button className="w-full" size="lg">
                  Sign Up to Connect
                </Button>
              </AuthDialog>
              <p className="text-sm text-muted-foreground">
                Already have an account? 
                <AuthDialog buttonText="Sign In" variant="link">
                  <button className="text-primary hover:underline ml-1">Sign In</button>
                </AuthDialog>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || publicLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        {/* Digital ID Card - Aadhaar/PAN Card Style */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-6 border border-orange-500/30 shadow-2xl max-w-sm mx-auto overflow-hidden" style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 70%, #0f172a 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(251, 146, 60, 0.2)'
        }}>
          {/* Background Watermark - Enhanced Holographic Favicon */}
          <div className="absolute inset-0 opacity-10 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45">
              <img 
                src="/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png" 
                alt="TalentXcel Hologram" 
                className="w-32 h-32 opacity-30 blur-[1px] mix-blend-overlay filter sepia saturate-150 hue-rotate-30"
              />
            </div>
            {/* Multiple holographic layers for depth */}
            <div className="absolute top-[30%] left-[20%] transform rotate-12">
              <img 
                src="/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png" 
                alt="TalentXcel Hologram" 
                className="w-16 h-16 opacity-20 blur-[2px] mix-blend-overlay filter sepia saturate-200"
              />
            </div>
            <div className="absolute bottom-[20%] right-[15%] transform -rotate-12">
              <img 
                src="/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png" 
                alt="TalentXcel Hologram" 
                className="w-20 h-20 opacity-15 blur-[1.5px] mix-blend-overlay filter sepia saturate-100 hue-rotate-60"
              />
            </div>
          </div>

          {/* Hologram Security Effects */}
          <div className="absolute top-2 right-2 w-12 h-12 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-sm"></div>
          <div className="absolute bottom-2 left-2 w-8 h-8 bg-gradient-to-tr from-orange-400/30 to-red-400/30 rounded-full blur-sm"></div>

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-orange-400 tracking-wide">TalentXcel Career Passport</h1>
              <div className="flex items-center gap-2 mt-1">
                <Target className="h-4 w-4 text-red-400" />
                <span className="text-gray-300 text-sm">Career Builder</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-xs mb-1">Unique ID</div>
              <div className="text-orange-400 font-bold text-sm">{getTalentXcelId()}</div>
            </div>
          </div>

          {/* Profile Section with QR Code */}
          <div className="relative z-10 flex items-center gap-4 mb-6">
            {/* Profile Photo - Enhanced like ID card */}
            <div className="relative">
              <div className="w-20 h-20 rounded-lg bg-gray-600 border-2 border-orange-400/50 overflow-hidden">
                <Avatar className="w-full h-full rounded-lg">
                  {getProfilePictureUrl() ? (
                    <AvatarImage 
                      src={getProfilePictureUrl()!} 
                      className="object-cover w-full h-full"
                    />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xl w-full h-full flex items-center justify-center rounded-lg">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* Security Badge */}
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-gray-900">
                ✓
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white mb-1">{displayData.profile?.full_name || user?.user_metadata?.full_name || 'User'}</h2>
              <p className="text-orange-400 font-medium text-sm mb-1">{displayData.profile?.title || displayData.profile?.headline || ''}</p>
              <div className="flex items-center gap-1 text-gray-300 text-xs">
                <span className="text-orange-400">📍</span> 
                <span>{displayData.profile?.location || ''}</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-lg p-2 shadow-lg">
              <div className="w-16 h-16 bg-black rounded flex items-center justify-center">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" className="w-full h-full rounded" />
                ) : (
                  <div className="w-full h-full bg-white flex items-center justify-center">
                    <div className="text-xs text-black font-mono">QR</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Career Ready Progress Circle */}
          <div className="relative z-10 flex items-center justify-center mb-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  stroke="rgb(55, 65, 81)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  stroke="rgb(251, 146, 60)"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 35}`}
                  strokeDashoffset={`${2 * Math.PI * 35 * (1 - getCareerReadiness() / 100)}`}
                  className="transition-all duration-1000 drop-shadow-lg"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{getCareerReadiness()}%</div>
                  <div className="text-xs text-gray-400">Career Ready</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800/60 border border-slate-600/50 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-gray-400 text-sm mb-1">Market Rank</div>
              <div className="text-white text-xl font-bold mb-1">
                {getMarketCompetitiveness() > 0 ? `Top ${100 - getMarketCompetitiveness()}%` : 'Not ranked'}
              </div>
              <div className="text-gray-400 text-xs">vs peers</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-600/50 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-gray-400 text-sm mb-1">Competitiveness</div>
              <div className="text-white text-xl font-bold mb-1">{getMarketCompetitiveness()}%</div>
              <div className="text-gray-400 text-xs">Score</div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="relative z-10 grid grid-cols-4 gap-2 mb-6">
            <div className="text-center bg-slate-800/40 rounded-lg p-3 border border-slate-600/30">
              <div className="text-xl font-bold text-orange-400 mb-1">{displayData.passport?.resumes_count || 0}</div>
              <div className="text-xs text-gray-400">Resumes</div>
            </div>
            <div className="text-center bg-slate-800/40 rounded-lg p-3 border border-slate-600/30">
              <div className="text-xl font-bold text-orange-400 mb-1">{displayData.passport?.jobs_applied_count || 0}</div>
              <div className="text-xs text-gray-400">Jobs Applied</div>
            </div>
            <div className="text-center bg-slate-800/40 rounded-lg p-3 border border-slate-600/30">
              <div className="text-xl font-bold text-orange-400 mb-1">{displayData.passport?.certifications_count || 0}</div>
              <div className="text-xs text-gray-400">Certifications</div>
            </div>
            <div className="text-center bg-slate-800/40 rounded-lg p-3 border border-slate-600/30">
              <div className="text-xl font-bold text-orange-400 mb-1">{displayData.passport?.connections_count || 0}</div>
              <div className="text-xs text-gray-400">Connections</div>
            </div>
          </div>

          {/* Digital ID Footer with Validity */}
          <div className="relative z-10 border-t border-gray-600/50 pt-4 flex justify-between items-center text-xs text-gray-400">
            <span>Issued Aug 2025</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Valid Thru 2028</span>
            </div>
          </div>
        </div>

        {/* Simplified Header with QR Generation */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {isPublicView ? `${displayData.profile?.full_name}'s Career Passport` : 'Career Passport'}
            </h1>
            <p className="text-gray-400 text-sm">Transforming Businesses and Lives</p>
          </div>
          
          <div className="flex items-center gap-3">
            {displayData.isOwner && (
              <Button 
                onClick={generateQRCode} 
                disabled={isGeneratingQR} 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <QrCode className="h-4 w-4 mr-2" />
                {isGeneratingQR ? 'Generating...' : 'Generate QR'}
              </Button>
            )}
            
            {/* Connection Actions for Public View */}
            {isPublicView && user && (
              <div className="flex gap-2">
                {connectionStatus === 'none' && (
                  <Button onClick={handleSendConnectionRequest} size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                )}
                {connectionStatus === 'pending' && (
                  <Button disabled variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Request Sent
                  </Button>
                )}
                {connectionStatus === 'connected' && (
                  <Button onClick={() => navigate(`/network/messages?userId=${userId}`)} size="sm" variant="default">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                )}
                <Button onClick={handleShareProfile} variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
          {/* Progress Journey Bar */}
          {displayData.isOwner && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <TrendingUp className="h-5 w-5" />
                  Career Growth Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getProgressLevel(getCompletionPercentage()).color}`}></div>
                      <span className="font-medium">{getProgressLevel(getCompletionPercentage()).level}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Next: {getProgressLevel(getCompletionPercentage()).next}
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${getProgressLevel(getCompletionPercentage()).color} relative`}
                      style={{ width: `${getCompletionPercentage()}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                      {getCompletionPercentage()}% Complete
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Advanced</span>
                    <span>Expert</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actionable Next Steps */}
          {displayData.isOwner && getActionSteps().length > 0 && (
            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Zap className="h-5 w-5" />
                  🚀 Your Next Steps
                </CardTitle>
                <CardDescription>Take action to boost your career readiness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getActionSteps().map((step, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                        step.priority === 'high' ? 'bg-red-50 border-red-200' :
                        step.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}
                      onClick={step.action}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        step.priority === 'high' ? 'bg-red-100' :
                        step.priority === 'medium' ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }`}>
                        <step.icon className={`h-4 w-4 ${
                          step.priority === 'high' ? 'text-red-600' :
                          step.priority === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{step.text}</p>
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            step.priority === 'high' ? 'text-red-700 border-red-300' :
                            step.priority === 'medium' ? 'text-yellow-700 border-yellow-300' :
                            'text-blue-700 border-blue-300'
                          }`}
                        >
                          {step.priority} priority
                        </Badge>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Career Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card 
                className={`hover:shadow-lg transition-all border-l-4 border-l-blue-500 ${displayData.isOwner ? 'hover:scale-105 cursor-pointer' : ''}`}
                onClick={displayData.isOwner ? handleCreateResume : undefined}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 relative">
                      <FileText className="h-7 w-7 text-blue-600" />
                      {(displayData.passport?.resumes_count || 0) > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {displayData.passport?.resumes_count || 0}
                    </div>
                    <div className="text-sm font-medium text-gray-600 mb-2">Resumes Created</div>
                    {displayData.isOwner && (displayData.passport?.resumes_count || 0) === 0 && (
                      <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                        +15% readiness boost
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`hover:shadow-lg transition-all border-l-4 border-l-purple-500 ${displayData.isOwner ? 'hover:scale-105 cursor-pointer' : ''}`}
                onClick={displayData.isOwner ? handleApplyJobs : undefined}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 relative">
                      <Briefcase className="h-7 w-7 text-purple-600" />
                      {(displayData.passport?.jobs_applied_count || 0) > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {displayData.passport?.jobs_applied_count || 0}
                    </div>
                    <div className="text-sm font-medium text-gray-600 mb-2">Jobs Applied</div>
                    {displayData.isOwner && (
                      <div className="text-xs text-purple-600 font-medium">
                        {(displayData.passport?.jobs_applied_count || 0) > 0 ? 'Active job seeker' : 'Start applying!'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`hover:shadow-lg transition-all border-l-4 border-l-green-500 ${displayData.isOwner ? 'hover:scale-105 cursor-pointer' : ''}`}
                onClick={displayData.isOwner ? handleGetCertified : undefined}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 relative">
                      <Shield className="h-7 w-7 text-green-600" />
                      {(displayData.passport?.certifications_count || 0) > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {displayData.passport?.certifications_count || 0}
                    </div>
                    <div className="text-sm font-medium text-gray-600 mb-2">Certifications</div>
                    {displayData.isOwner && (displayData.passport?.certifications_count || 0) === 0 && (
                      <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                        +20% competitiveness
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`hover:shadow-lg transition-all border-l-4 border-l-orange-500 ${displayData.isOwner ? 'hover:scale-105 cursor-pointer' : ''}`}
                onClick={displayData.isOwner ? handleBuildNetwork : undefined}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4 relative">
                      <Users className="h-7 w-7 text-orange-600" />
                      {(displayData.passport?.connections_count || 0) > 5 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {displayData.passport?.connections_count || 0}
                    </div>
                    <div className="text-sm font-medium text-gray-600 mb-2">Connections</div>
                    {displayData.isOwner && (
                      <div className="text-xs text-orange-600 font-medium">
                        {(displayData.passport?.connections_count || 0) > 10 ? 'Great network!' : 'Build network'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Photo Prompt - only for owner without UPLOADED photos */}
            {needsPhotoPrompt() && (
              <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="text-3xl">📸</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-blue-900 mb-2">Add Your Professional Photo</h3>
                      <p className="text-blue-700 text-sm mb-3">
                        Upload your professional photo to make your Career Passport complete. Profiles with photos get 40% more views and build trust with recruiters.
                      </p>
                      <Button 
                        onClick={() => navigate('/profile/edit?section=photo')}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Photo Now
                      </Button>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                        +40% Views
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced AI Career Coach - only for owner */}
            {displayData.isOwner && (
              <Card className="border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">🚀 AI Career Coach</CardTitle>
                        <p className="text-sm text-muted-foreground">Personalized recommendations</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Smart</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Next Best Action</p>
                          <p className="text-sm text-gray-600 mb-3">
                            {getCompletionPercentage() < 70 
                              ? 'Complete your profile sections to boost readiness by +25%'
                              : getCareerReadiness() < 80
                              ? 'Add 2 more relevant skills to increase competitiveness by +15%'
                              : 'Apply to 3 recommended jobs to increase interview chances'
                            }
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-indigo-600 hover:bg-indigo-700"
                              onClick={getCompletionPercentage() < 70 ? handleCompleteProfile : handleAddWorkExperience}
                            >
                              {getCompletionPercentage() < 70 ? 'Complete Profile' : 'Add Skills'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCompleteProfile}>
                              View All Tips
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto p-3 flex flex-col items-center gap-1"
                        onClick={handleAddWorkExperience}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="text-xs">Add Experience</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto p-3 flex flex-col items-center gap-1"
                        onClick={handleGetCertified}
                      >
                        <Award className="h-4 w-4" />
                        <span className="text-xs">Get Certified</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Public View Achievements */}
            {isPublicView && displayData.achievements && displayData.achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.achievements.slice(0, 3).map((achievement: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Award className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{achievement.achievement_title}</p>
                          <p className="text-xs text-muted-foreground">{achievement.achievement_description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          +{achievement.points_awarded}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Next Milestone - only for owner */}
            {displayData.isOwner && (
              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-800">
                    <TrendingUp className="h-5 w-5" />
                    🎯 Next Milestone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-emerald-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Target className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-emerald-800">
                              {100 - getCompletionPercentage()} points to next level
                            </p>
                            <p className="text-sm text-emerald-600">
                              {getCompletionPercentage() >= 90 ? 'Career Expert' :
                               getCompletionPercentage() >= 70 ? 'Skill Master' :
                               getCompletionPercentage() >= 50 ? 'Career Builder' : 'Professional'}
                            </p>
                          </div>
                        </div>
                        <Trophy className="h-6 w-6 text-yellow-500" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Progress to next badge</span>
                          <span className="text-sm font-medium">{getCompletionPercentage()}%</span>
                        </div>
                        <Progress value={getCompletionPercentage()} className="h-2" />
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={getCompletionPercentage() < 70 ? handleCompleteProfile : handleAddWorkExperience}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Complete Next Action
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Sidebar Profile Card */}
            <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {isPublicView ? '👤 Public Profile' : '🎯 Career Dashboard'}
                  </CardTitle>
                  {displayData.isOwner && (
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 mb-6">
                  {getProfilePictureUrl() && (
                    <Avatar className="h-14 w-14 border-3 border-white/30 shadow-lg">
                      <AvatarImage src={getProfilePictureUrl()} />
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-1">
                      {isPublicView 
                        ? displayData.profile?.full_name || 'Professional'
                        : `Hi ${getDisplayName()}`
                      }
                    </h3>
                    <p className="text-white/90 text-sm mb-2">
                      {isPublicView 
                        ? `${getCompletionPercentage()}% Career Ready`
                        : `you're ${getCompletionPercentage()}% Career Ready!`
                      }
                    </p>
                    {displayData.profile?.headline && (
                      <p className="text-white/70 text-xs">{displayData.profile.headline}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/90">Profile Completion</span>
                      <span className="font-bold">{getCompletionPercentage()}%</span>
                    </div>
                    <Progress value={getCompletionPercentage()} className="h-2 bg-white/20" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/90">Market Competitiveness</span>
                      <span>{getMarketCompetitiveness()}%</span>
                    </div>
                    <Progress value={getMarketCompetitiveness()} className="h-1.5 bg-white/20" />
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Peer Comparison */}
            {getPeerComparison() && (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Users className="h-5 w-5" />
                    🏆 Peer Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="text-3xl font-bold text-green-700 mb-1">
                        Top {100 - getPeerComparison()!.percentile}%
                      </div>
                      <p className="text-sm text-green-600 mb-2">
                        among {getPeerComparison()!.title} in {getPeerComparison()!.location}
                      </p>
                      <div className="w-full bg-green-100 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${getPeerComparison()!.percentile}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on career readiness and market competitiveness
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Career Readiness Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  📊 Readiness Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Profile Completeness</span>
                      <span className="text-sm font-bold">{Math.min(40, (getCompletionPercentage() * 0.4))}%</span>
                    </div>
                    <Progress value={Math.min(40, (getCompletionPercentage() * 0.4))} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Experience & Skills</span>
                      <span className="text-sm font-bold">{Math.min(30, (displayData.passport?.certifications_count || 0) * 10)}%</span>
                    </div>
                    <Progress value={Math.min(30, (displayData.passport?.certifications_count || 0) * 10)} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Network Strength</span>
                      <span className="text-sm font-bold">{Math.min(20, Math.floor((displayData.passport?.connections_count || 0) / 5) * 5)}%</span>
                    </div>
                    <Progress value={Math.min(20, Math.floor((displayData.passport?.connections_count || 0) / 5) * 5)} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Activity & Engagement</span>
                      <span className="text-sm font-bold">{Math.min(10, (displayData.passport?.jobs_applied_count || 0) * 2)}%</span>
                    </div>
                    <Progress value={Math.min(10, (displayData.passport?.jobs_applied_count || 0) * 2)} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share Career Passport */}
            {displayData.isOwner && (
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Share2 className="h-5 w-5" />
                    📤 Share Your Passport
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-blue-700">
                      Share your Career Passport with recruiters, peers, and your network to showcase your professional growth.
                    </p>
                    
                    <div className="space-y-2">
                      <Button 
                        onClick={shareCareerPassport} 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Passport Link
                      </Button>
                      
                      {publicProfile?.public_url && (
                        <Button 
                          onClick={copyPublicUrl} 
                          variant="outline" 
                          className="w-full"
                          size="sm"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Public URL
                        </Button>
                      )}
                      
                      <Button 
                        onClick={() => navigator.share?.({
                          title: 'My TalentXcel Career Passport',
                          text: 'Check out my professional career progress',
                          url: publicProfile?.public_url || `https://talentxcel.in/passport/${user?.id}`
                        })} 
                        variant="outline" 
                        className="w-full"
                        size="sm"
                        disabled={!navigator.share}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Share to Social
                      </Button>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-2 text-xs text-blue-600">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Public profile active</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions - only for owner */}
            {displayData.isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-md flex items-center justify-center">
                      <Target className="h-3 w-3 text-white" />
                    </div>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      size="sm" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700" 
                      variant="outline"
                      onClick={handleAddWorkExperience}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Work Experience
                    </Button>
                    <Button 
                      size="sm" 
                      className="w-full" 
                      variant="outline"
                      onClick={handleGetCertified}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Get Certified
                    </Button>
                    <Button 
                      size="sm" 
                      className="w-full" 
                      variant="outline"
                      onClick={handleBuildNetwork}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Build Network
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact/Connect for public view */}
            {isPublicView && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Users className="h-5 w-5" />
                    Connect
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleSendConnectionRequest}
                      disabled={!user}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {!user ? 'Sign in to Connect' : 'Send Connection Request'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleShareProfile}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* QR Code Section */}
            {publicProfile?.qr_code_data && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Share Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="inline-block p-3 bg-white rounded-lg border mb-3">
                    <img 
                      src={publicProfile.qr_code_data} 
                      alt="Career Passport QR Code"
                      className="w-20 h-20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyPublicUrl}
                      className="w-full"
                    >
                      <Copy className="h-3 w-3 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareerPassportDashboard;