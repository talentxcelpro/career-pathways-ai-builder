import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, safeApiCall } from '@/utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface CareerPassportData {
  profile?: any;
  passport?: any;
  completion?: any;
  publicProfile?: any;
  analytics?: any;
}

export function CareerPassportDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<CareerPassportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPassportData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load passport data
      const passportData = await safeApiCall(() => 
        apiClient.getCareerPassport(user.id)
      );

      // Load analytics
      const analyticsData = await safeApiCall(() =>
        apiClient.getPlatformAnalytics(user.id)
      );

      setData({
        profile: passportData?.profile,
        passport: passportData?.passport,
        completion: passportData?.completion,
        analytics: analyticsData
      });
    } catch (err) {
      console.error('Failed to load passport data:', err);
      setError('Failed to load career passport data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!user?.id) return;

    setIsGeneratingQR(true);
    try {
      const result = await apiClient.generateQRCode(user.id);
      if (result.success && result.data) {
        setData(prev => prev ? {
          ...prev,
          publicProfile: {
            qr_code_data: result.data.qrCodeData,
            public_url: result.data.publicUrl
          }
        } : null);
        toast.success('QR code generated successfully!');
      } else {
        toast.error(result.error || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const copyPublicUrl = () => {
    if (data?.publicProfile?.public_url) {
      navigator.clipboard.writeText(data.publicProfile.public_url);
      toast.success('Public URL copied to clipboard!');
    }
  };

  useEffect(() => {
    loadPassportData();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={loadPassportData}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const profile = data?.profile || {};
  const passport = data?.passport || {};
  const completion = data?.completion || {};

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Career Passport
            </h1>
            <p className="text-muted-foreground">
              Your comprehensive professional profile and achievements
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              <Award className="h-3 w-3 mr-1" />
              {profile.member_id || 'TXL001'}
            </Badge>
            
            <Button onClick={generateQRCode} disabled={isGeneratingQR} size="sm">
              <QrCode className="h-4 w-4 mr-2" />
              {isGeneratingQR ? 'Generating...' : 'Generate QR'}
            </Button>
          </div>
        </div>

        {/* Profile Overview */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="text-2xl">👤</div>
              {profile.name || 'TalentXcel Professional'}
            </CardTitle>
            <CardDescription className="text-lg">
              {profile.tagline || 'Transforming careers, one step at a time'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Profile Completion</span>
                  <span className="text-sm text-muted-foreground">
                    {completion.percentage || 0}%
                  </span>
                </div>
                <Progress value={completion.percentage || 0} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Career Readiness</span>
                  <span className="text-sm text-muted-foreground">
                    {profile.career_readiness_score || 0}/100
                  </span>
                </div>
                <Progress value={profile.career_readiness_score || 0} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Market Competitiveness</span>
                  <span className="text-sm text-muted-foreground">
                    {profile.market_competitiveness_score || 0}/100
                  </span>
                </div>
                <Progress value={profile.market_competitiveness_score || 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {passport.resumes_created || 0}
              </div>
              <div className="text-sm text-muted-foreground">Resumes Created</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {passport.jobs_applied || 0}
              </div>
              <div className="text-sm text-muted-foreground">Jobs Applied</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {passport.certifications || 0}
              </div>
              <div className="text-sm text-muted-foreground">Certifications</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {passport.network_connections || 0}
              </div>
              <div className="text-sm text-muted-foreground">Connections</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code & Sharing */}
      {data?.publicProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Your Profile
            </CardTitle>
            <CardDescription>
              Share your career passport with employers and connections
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QR Code */}
              <div className="text-center space-y-4">
                <div className="inline-block p-4 bg-white rounded-lg border">
                  <img 
                    src={data.publicProfile.qr_code_data} 
                    alt="Career Passport QR Code"
                    className="w-32 h-32"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Scan to view profile
                  </p>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download QR
                  </Button>
                </div>
              </div>
              
              {/* Public URL */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Public Profile URL</label>
                  <div className="flex mt-2">
                    <input
                      type="text"
                      value={data.publicProfile.public_url || ''}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-l-md bg-muted text-sm"
                    />
                    <Button
                      onClick={copyPublicUrl}
                      variant="outline"
                      size="sm"
                      className="rounded-l-none"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {completion?.next_steps && completion.next_steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {completion.next_steps.map((step: string, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CareerPassportDashboard;