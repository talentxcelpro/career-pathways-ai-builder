import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Eye, 
  Download, 
  Share, 
  TrendingUp, 
  Clock,
  Users,
  Star,
  Target,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ResumeCareerAnalyticsProps {
  resumeId: string;
  resumeData: any;
}

export const ResumeCareerAnalytics: React.FC<ResumeCareerAnalyticsProps> = ({
  resumeId,
  resumeData
}) => {
  const { user } = useAuth();
  const [CareerAnalytics, setCareerAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (resumeId && resumeId !== 'new') {
      fetchCareerAnalytics();
    } else {
      setIsLoading(false);
    }
  }, [resumeId]);

  const fetchCareerAnalytics = async () => {
    try {
      // Mock CareerAnalytics data for now - in production, this would come from actual tracking
      const mockCareerAnalytics = {
        views: {
          total: Math.floor(Math.random() * 100) + 20,
          thisWeek: Math.floor(Math.random() * 20) + 5,
          unique: Math.floor(Math.random() * 80) + 15
        },
        downloads: {
          total: Math.floor(Math.random() * 50) + 10,
          thisWeek: Math.floor(Math.random() * 10) + 2,
          formats: {
            pdf: Math.floor(Math.random() * 30) + 8,
            docx: Math.floor(Math.random() * 20) + 2
          }
        },
        shares: {
          total: Math.floor(Math.random() * 25) + 5,
          platforms: {
            linkedin: Math.floor(Math.random() * 15) + 3,
            email: Math.floor(Math.random() * 10) + 2
          }
        },
        performance: {
          atsScore: Math.floor(Math.random() * 30) + 70,
          completeness: calculateCompleteness(),
          lastUpdated: new Date().toISOString(),
          avgTimeOnPage: '2:34'
        }
      };

      setCareerAnalytics(mockCareerAnalytics);
    } catch (error) {
      console.error('Failed to fetch CareerAnalytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCompleteness = () => {
    if (!resumeData?.sections) return 0;
    
    let completedSections = 0;
    let totalSections = resumeData.sections.length;

    resumeData.sections.forEach((section: any) => {
      if (section.type === 'personal' && section.content?.fullName) {
        completedSections++;
      } else if (section.type === 'summary' && section.content?.text) {
        completedSections++;
      } else if (section.content?.items && section.content.items.length > 0) {
        completedSections++;
      }
    });

    return Math.round((completedSections / totalSections) * 100);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (resumeId === 'new' || !CareerAnalytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resume CareerAnalytics
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">
            Save your resume to start tracking CareerAnalytics
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Resume CareerAnalytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Views</span>
                </div>
                <div className="text-2xl font-bold">{CareerAnalytics.views.total}</div>
                <div className="text-xs text-muted-foreground">
                  +{CareerAnalytics.views.thisWeek} this week
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Downloads</span>
                </div>
                <div className="text-2xl font-bold">{CareerAnalytics.downloads.total}</div>
                <div className="text-xs text-muted-foreground">
                  +{CareerAnalytics.downloads.thisWeek} this week
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Share className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Shares</span>
                </div>
                <div className="text-2xl font-bold">{CareerAnalytics.shares.total}</div>
                <div className="text-xs text-muted-foreground">
                  Across all platforms
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Unique Views</span>
                </div>
                <div className="text-2xl font-bold">{CareerAnalytics.views.unique}</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((CareerAnalytics.views.unique / CareerAnalytics.views.total) * 100)}% of total
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Download Formats</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>PDF Downloads</span>
                    <span>{CareerAnalytics.downloads.formats.pdf}</span>
                  </div>
                  <Progress 
                    value={(CareerAnalytics.downloads.formats.pdf / CareerAnalytics.downloads.total) * 100} 
                    className="h-2"
                  />
                  
                  <div className="flex justify-between text-sm">
                    <span>DOCX Downloads</span>
                    <span>{CareerAnalytics.downloads.formats.docx}</span>
                  </div>
                  <Progress 
                    value={(CareerAnalytics.downloads.formats.docx / CareerAnalytics.downloads.total) * 100} 
                    className="h-2"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Share Platforms</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">LinkedIn</span>
                    <Badge variant="secondary">{CareerAnalytics.shares.platforms.linkedin}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Email</span>
                    <Badge variant="secondary">{CareerAnalytics.shares.platforms.email}</Badge>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Average Time on Page</span>
                  <span className="text-sm font-bold">{CareerAnalytics.performance.avgTimeOnPage}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Time recruiters spend viewing your resume
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">ATS Compatibility Score</span>
                  <Badge 
                    variant={CareerAnalytics.performance.atsScore >= 80 ? 'default' : 
                            CareerAnalytics.performance.atsScore >= 60 ? 'secondary' : 'destructive'}
                  >
                    {CareerAnalytics.performance.atsScore}/100
                  </Badge>
                </div>
                <Progress value={CareerAnalytics.performance.atsScore} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  How well your resume works with applicant tracking systems
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Profile Completeness</span>
                  <Badge variant="secondary">{CareerAnalytics.performance.completeness}%</Badge>
                </div>
                <Progress value={CareerAnalytics.performance.completeness} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Percentage of recommended sections completed
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Last Updated</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(CareerAnalytics.performance.lastUpdated).toLocaleDateString()}
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Performance Tip</p>
                    <p className="text-xs text-blue-700">
                      Resumes with ATS scores above 80 get 3x more interviews. 
                      Consider optimizing your keywords and formatting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};



