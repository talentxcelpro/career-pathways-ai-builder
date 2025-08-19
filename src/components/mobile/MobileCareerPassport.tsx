import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCareerPassport } from '@/hooks/useCareerPassport';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { useToast } from '@/hooks/use-toast';
import { 
  QrCode, 
  Share2, 
  ExternalLink, 
  Copy,
  Award,
  TrendingUp,
  Users,
  Briefcase,
  Trophy,
  Target,
  MessageCircle,
  UserPlus,
  MapPin,
  Building,
  GraduationCap,
  Star,
  ArrowRight,
  PhoneCall,
  Mail,
  Linkedin,
  Download
} from 'lucide-react';

export const MobileCareerPassport: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { careerPassport, achievements, isLoading } = useCareerPassport();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [publicProfile, setPublicProfile] = useState<any>(null);
  const [publicPassportData, setPublicPassportData] = useState<any>(null);
  const [isPublicView, setIsPublicView] = useState(false);
  const [publicLoading, setPublicLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');

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
        setIsPublicView(false);
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

    const loadPublicPassportData = async (targetUserId: string) => {
      setPublicLoading(true);
      try {
        // Fetch public profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, headline, location, profile_picture_url, talentxcel_id, bio, current_company, current_position, years_of_experience, skills')
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
        talentxcel_id: profile?.talentxcel_id,
        // These fields will come from the publicPassportData for now
        bio: undefined,
        current_company: undefined,
        current_position: undefined,
        years_of_experience: undefined,
        skills: undefined
      },
      passport: careerPassport,
      achievements: achievements,
      isOwner: true
    };
  };

  const displayData = getDisplayData();

  const getUserInitials = () => {
    const name = displayData.profile?.full_name;
    if (!name) return 'U';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  const getCompletionPercentage = () => displayData.passport?.completion_percentage || 40;
  const getCareerReadiness = () => displayData.passport?.career_readiness_score || 60;
  const getDisplayName = () => displayData.profile?.full_name || 'Professional';

  const handleShare = async () => {
    const shareUrl = `https://talentxcel.in/passport/${userId || user?.id}`;
    const shareData = {
      title: `${getDisplayName()}'s Career Passport - TalentXcel`,
      text: `Check out ${getDisplayName()}'s professional career passport on TalentXcel`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Career passport link copied to clipboard!",
        });
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Career passport link copied to clipboard!",
        });
      } catch (clipboardError) {
        toast({
          title: "Share failed",
          description: "Unable to share or copy link.",
          variant: "destructive",
        });
      }
    }
  };

  const handleConnect = async () => {
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
      
      toast({
        title: "Connection request sent!",
        description: "Your connection request has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Failed to connect",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleMessage = () => {
    navigate(`/network/messages?userId=${userId}`);
  };

  const handleGenerateQR = () => {
    navigate('/mobile/qr-scanner');
  };

  // Show authentication prompt for unauthenticated users viewing public profiles
  if (!user && isPublicView) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <Award className="h-12 w-12 text-primary mx-auto mb-3" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Join TalentXcel to Connect
                </h2>
                <p className="text-gray-600 mb-4">
                  Sign up to view full career passports and connect with professionals
                </p>
              </div>
              <AuthDialog buttonText="Sign Up to Connect" variant="default">
                <Button className="w-full">
                  Sign Up to Connect
                </Button>
              </AuthDialog>
              <p className="text-sm text-gray-500 mt-3">
                Already have an account? 
                <AuthDialog buttonText="Sign In" variant="link">
                  <button className="text-primary hover:underline ml-1">Sign In</button>
                </AuthDialog>
              </p>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  if (isLoading || publicLoading) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Profile Card */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
          <div className="relative p-6 pb-8">
            {/* Header Actions */}
            <div className="flex justify-end mb-4">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                {displayData.isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleGenerateQR}
                    className="text-white hover:bg-white/20 rounded-full"
                  >
                    <QrCode className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="h-20 w-20 border-4 border-white/30">
                <AvatarImage src={displayData.profile?.profile_picture_url} />
                <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">
                  {getDisplayName()}
                </h1>
                {displayData.profile?.current_position && (
                  <p className="text-white/90 text-lg mb-1">
                    {displayData.profile.current_position}
                  </p>
                )}
                {displayData.profile?.current_company && (
                  <p className="text-white/80 flex items-center gap-1 mb-2">
                    <Building className="h-4 w-4" />
                    {displayData.profile.current_company}
                  </p>
                )}
                {displayData.profile?.location && (
                  <p className="text-white/80 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {displayData.profile.location}
                  </p>
                )}
              </div>
            </div>

            {/* TalentXcel ID & Badge */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Award className="h-3 w-3 mr-1" />
                TXL{displayData.profile?.talentxcel_id?.slice(-3) || '001'}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {getCompletionPercentage() >= 90 ? '🏆 Career Expert' : 
                 getCompletionPercentage() >= 70 ? '⭐ Skill Master' : 
                 getCompletionPercentage() >= 50 ? '🎯 Career Builder' : '🌱 Getting Started'}
              </Badge>
            </div>

            {/* Career Readiness */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/90 font-medium">Career Readiness</span>
                <span className="text-white font-bold">{getCompletionPercentage()}%</span>
              </div>
              <Progress value={getCompletionPercentage()} className="h-2 bg-white/20" />
            </div>
          </div>
        </div>

        {/* Action Buttons for Public View */}
        {isPublicView && user && (
          <div className="p-4 bg-white border-b">
            <div className="flex gap-3">
              {connectionStatus === 'none' && (
                <Button
                  onClick={handleConnect}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl h-12"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              )}
              {connectionStatus === 'pending' && (
                <Button
                  disabled
                  variant="outline"
                  className="flex-1 rounded-xl h-12"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Request Sent
                </Button>
              )}
              {connectionStatus === 'connected' && (
                <Button
                  onClick={handleMessage}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-12"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              )}
              {connectionStatus !== 'connected' && (
                <Button
                  onClick={handleMessage}
                  variant="outline"
                  className="flex-1 rounded-xl h-12"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {displayData.passport?.resumes_count || 0}
                </div>
                <div className="text-sm text-gray-600">Resumes</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {displayData.passport?.connections_count || 0}
                </div>
                <div className="text-sm text-gray-600">Connections</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {displayData.passport?.certifications_count || 0}
                </div>
                <div className="text-sm text-gray-600">Certifications</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Target className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {displayData.passport?.jobs_applied_count || 0}
                </div>
                <div className="text-sm text-gray-600">Job Applications</div>
              </CardContent>
            </Card>
          </div>

          {/* Bio Section */}
          {displayData.profile?.bio && (
            <Card className="bg-white border-0 shadow-sm mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">
                  {displayData.profile.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Skills Section */}
          {displayData.profile?.skills && displayData.profile.skills.length > 0 && (
            <Card className="bg-white border-0 shadow-sm mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {displayData.profile.skills.slice(0, 8).map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="rounded-full">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements Section */}
          {displayData.achievements && displayData.achievements.length > 0 && (
            <Card className="bg-white border-0 shadow-sm mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Recent Achievements</h3>
                <div className="space-y-3">
                  {displayData.achievements.slice(0, 3).map((achievement: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-yellow-100 p-2 rounded-full shrink-0">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {achievement.achievement_title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {achievement.achievement_description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          +{achievement.points_awarded} points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Career Score */}
          <Card className="bg-white border-0 shadow-sm mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Career Scores</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Career Readiness</span>
                    <span className="text-sm font-bold text-primary">{getCareerReadiness()}%</span>
                  </div>
                  <Progress value={getCareerReadiness()} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Market Competitiveness</span>
                    <span className="text-sm font-bold text-primary">{displayData.passport?.market_competitiveness_score || 45}%</span>
                  </div>
                  <Progress value={displayData.passport?.market_competitiveness_score || 45} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions for Owner */}
          {displayData.isOwner && (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-between rounded-xl h-12"
                    onClick={() => navigate('/profile/edit')}
                  >
                    <span>Complete Profile</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-between rounded-xl h-12"
                    onClick={() => navigate('/resume/create')}
                  >
                    <span>Create Resume</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-between rounded-xl h-12"
                    onClick={() => navigate('/jobs')}
                  >
                    <span>Find Jobs</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};