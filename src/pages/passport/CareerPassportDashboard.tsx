import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  MoreHorizontal
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
  const { careerPassport, achievements, isLoading, getCompletionBreakdown, getNextMilestone } = useCareerPassport();
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [publicProfile, setPublicProfile] = useState<any>(null);
  const [publicPassportData, setPublicPassportData] = useState<any>(null);
  const [isPublicView, setIsPublicView] = useState(false);
  const [publicLoading, setPublicLoading] = useState(false);

  useEffect(() => {
    const initializeView = async () => {
      // Check if viewing someone else's passport (public view)
      if (userId && userId !== user?.id) {
        setIsPublicView(true);
        await loadPublicPassportData(userId);
      } else if (user?.id) {
        // Load own profile data
        setIsPublicView(false);
        await loadPublicProfile();
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

  const getUserInitials = () => {
    const name = displayData.profile?.full_name;
    if (!name) return 'U';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  const getCompletionPercentage = () => displayData.passport?.completion_percentage || 40;
  const getCareerReadiness = () => displayData.passport?.career_readiness_score || 60;
  const getMarketCompetitiveness = () => displayData.passport?.market_competitiveness_score || 45;
  const getDisplayName = () => displayData.profile?.full_name?.split(' ')[0] || 'User';

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary/10">
                <AvatarImage src={displayData.profile?.profile_picture_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {isPublicView ? `${displayData.profile?.full_name}'s Career Passport` : 'Career Passport'}
                </h1>
                {displayData.profile?.headline && (
                  <p className="text-muted-foreground">{displayData.profile.headline}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              <Award className="h-3 w-3 mr-1" />
              TXL{displayData.profile?.talentxcel_id?.slice(-3) || String(displayData.passport?.id).slice(-3) || (userId || user?.id)?.slice(-3) || '001'}
            </Badge>
            
            {/* Professional Badge */}
            <Badge variant="secondary" className="px-3 py-1">
              {getCompletionPercentage() >= 90 ? '🏆 Career Expert' : 
               getCompletionPercentage() >= 70 ? '⭐ Skill Master' : 
               getCompletionPercentage() >= 50 ? '🎯 Career Builder' : '🌱 Getting Started'}
            </Badge>
            
            {displayData.isOwner && (
              <Button onClick={generateQRCode} disabled={isGeneratingQR} size="sm">
                <QrCode className="h-4 w-4 mr-2" />
                {isGeneratingQR ? 'Generating...' : 'Generate QR'}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Hero Section */}
            <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
              <CardContent className="p-8 relative">
                <div className="flex items-start gap-6 mb-8">
                  <Avatar className="h-20 w-20 border-4 border-white/30 shadow-lg">
                    <AvatarImage src={displayData.profile?.profile_picture_url} />
                    <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-3">
                      {isPublicView 
                        ? `${getDisplayName()} is ${getCompletionPercentage()}% Career Ready!`
                        : `Hi ${getDisplayName()}, you're ${getCompletionPercentage()}% Career Ready!`
                      }
                    </h2>
                    <p className="text-white/90 text-lg mb-2">
                      {displayData.profile?.headline || `${isPublicView ? 'Professional' : 'Complete your profile to unlock more'} career opportunities`}
                    </p>
                    {displayData.profile?.location && (
                      <p className="text-white/70 flex items-center gap-1">
                        📍 {displayData.profile.location}
                      </p>
                    )}
                  </div>
                  
                  {/* Market Benchmark */}
                  <div className="text-right space-y-2">
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-sm text-white/80">Market Rank</div>
                      <div className="text-2xl font-bold">
                        Top {100 - getMarketCompetitiveness()}%
                      </div>
                      <div className="text-xs text-white/70">vs peers</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/90">Profile Completion</span>
                      <span className="text-lg font-bold">{getCompletionPercentage()}%</span>
                    </div>
                    <Progress value={getCompletionPercentage()} className="h-3 bg-white/20" />
                    <div className="text-xs text-white/70">
                      {getCompletionPercentage() >= 90 ? '🎉 Excellent!' : 
                       getCompletionPercentage() >= 70 ? '👍 Good progress' :
                       getCompletionPercentage() >= 50 ? '📈 Keep going' : '🚀 Just started'}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/90">Career Readiness</span>
                      <span className="text-lg font-bold">{getCareerReadiness()}%</span>
                    </div>
                    <Progress value={getCareerReadiness()} className="h-3 bg-white/20" />
                    <div className="text-xs text-white/70">
                      {getCareerReadiness() >= 80 ? 'Industry ready' : 
                       getCareerReadiness() >= 60 ? 'Nearly there' : 'Building skills'}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/90">Market Competitiveness</span>
                      <span className="text-lg font-bold">{getMarketCompetitiveness()}%</span>
                    </div>
                    <Progress value={getMarketCompetitiveness()} className="h-3 bg-white/20" />
                    <div className="text-xs text-white/70">
                      {getMarketCompetitiveness() >= 75 ? 'Highly competitive' : 
                       getMarketCompetitiveness() >= 50 ? 'Competitive' : 'Building edge'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Career Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="hover:shadow-lg transition-all hover:scale-105 border-l-4 border-l-blue-500">
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
              
              <Card className="hover:shadow-lg transition-all hover:scale-105 border-l-4 border-l-purple-500">
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
              
              <Card className="hover:shadow-lg transition-all hover:scale-105 border-l-4 border-l-green-500">
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
              
              <Card className="hover:shadow-lg transition-all hover:scale-105 border-l-4 border-l-orange-500">
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
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                              {getCompletionPercentage() < 70 ? 'Complete Profile' : 'Add Skills'}
                            </Button>
                            <Button size="sm" variant="outline">
                              View All Tips
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col items-center gap-1">
                        <Plus className="h-4 w-4" />
                        <span className="text-xs">Add Experience</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col items-center gap-1">
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
                    
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
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
                  <Avatar className="h-14 w-14 border-3 border-white/30 shadow-lg">
                    <AvatarImage src={displayData.profile?.profile_picture_url} />
                    <AvatarFallback className="bg-white/20 text-white font-bold text-lg">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
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
                    <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Work Experience
                    </Button>
                    <Button size="sm" className="w-full" variant="outline">
                      <Award className="h-4 w-4 mr-2" />
                      Get Certified
                    </Button>
                    <Button size="sm" className="w-full" variant="outline">
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
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Users className="h-4 w-4 mr-2" />
                      Send Connection Request
                    </Button>
                    <Button variant="outline" className="w-full">
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