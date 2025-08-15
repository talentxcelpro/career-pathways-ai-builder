import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCareerPassport } from '@/hooks/useCareerPassport';
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
  const { user } = useAuth();
  const { careerPassport, achievements, isLoading, getCompletionBreakdown, getNextMilestone } = useCareerPassport();
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [publicProfile, setPublicProfile] = useState<any>(null);

  useEffect(() => {
    const loadPublicProfile = async () => {
      if (!user?.id) return;
      
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

    loadPublicProfile();
  }, [user?.id]);

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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return 'U';
    return user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  const getCompletionPercentage = () => careerPassport?.completion_percentage || 40;
  const getCareerReadiness = () => careerPassport?.career_readiness_score || 60;
  const getMarketCompetitiveness = () => careerPassport?.market_competitiveness_score || 45;

  if (isLoading) {
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Career Passport</h1>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              <Award className="h-3 w-3 mr-1" />
              TXL{String(careerPassport?.id).slice(-3) || user?.id?.slice(-3) || '001'}
            </Badge>
            
            <Button onClick={generateQRCode} disabled={isGeneratingQR} size="sm">
              <QrCode className="h-4 w-4 mr-2" />
              {isGeneratingQR ? 'Generating...' : 'Generate QR'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
              <CardContent className="p-8 relative">
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="h-16 w-16 border-4 border-white/20">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Hi {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}, you're {getCompletionPercentage()}% Career Ready!
                    </h2>
                    <p className="text-white/80">
                      Complete your profile to unlock more job opportunities
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/90">Profile Completion</span>
                      <span className="text-sm font-bold">{getCompletionPercentage()}%</span>
                    </div>
                    <Progress value={getCompletionPercentage()} className="h-2 bg-white/20" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/90">Career Readiness</span>
                      <span className="text-sm font-bold">{getCareerReadiness()}%</span>
                    </div>
                    <Progress value={getCareerReadiness()} className="h-2 bg-white/20" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/90">Market Competitiveness</span>
                      <span className="text-sm font-bold">{getMarketCompetitiveness()}%</span>
                    </div>
                    <Progress value={getMarketCompetitiveness()} className="h-2 bg-white/20" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {careerPassport?.resumes_count || 0}
                    </div>
                    <div className="text-sm text-gray-600">Resumes Created</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Create your first resume to boost resultless by +15%
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                      <Briefcase className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {careerPassport?.jobs_applied_count || 0}
                    </div>
                    <div className="text-sm text-gray-600">Jobs Applied</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {careerPassport?.certifications_count || 0}
                    </div>
                    <div className="text-sm text-gray-600">Certifications</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {careerPassport?.connections_count || 0}
                    </div>
                    <div className="text-sm text-gray-600">Connections</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Career Coach */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle>AI Career Coach</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium">Add 2 more skills</p>
                      <p className="text-sm text-gray-600">to increase competitiveness by +10%</p>
                    </div>
                  </div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Add Skills
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Next Milestone */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Next Milestone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">+24 points</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-600">Next Milestone</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Career Builder Badge</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button className="w-full" variant="outline">
                    Complete Profile Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Career Passport Card */}
            <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Career Passport</CardTitle>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-white/20">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-white/20 text-white font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">
                      Hi {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}
                    </h3>
                    <p className="text-white/80 text-sm">you're {getCompletionPercentage()}% Career Ready!</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/90">Profile Completion</span>
                      <span>{getCompletionPercentage()}%</span>
                    </div>
                    <Progress value={getCompletionPercentage()} className="h-1.5 bg-white/20" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/90">Market Competitiveness</span>
                      <span>{getMarketCompetitiveness()}%</span>
                    </div>
                    <Progress value={getMarketCompetitiveness()} className="h-1.5 bg-white/20" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-medium">Resumes Created</div>
                  </div>
                  <div>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-medium">Certifications</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Career Coach Sidebar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                  AI Career Coach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Complete your work experience to unlock Professional badge</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Add Work Experience
                  </Button>
                </div>
              </CardContent>
            </Card>

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