import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Eye, 
  Download, 
  Target, 
  Brain, 
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Users,
  Clock,
  Zap
} from 'lucide-react';
import { EditorResume } from '@/types/editor-resume';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ResumeAnalyticsProps {
  resume: EditorResume;
  className?: string;
}

interface AnalyticsData {
  completionScore: number;
  atsScore: number;
  readabilityScore: number;
  successPrediction: number;
  views: number;
  downloads: number;
  applications: number;
  interviews: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywordMatch: {
    score: number;
    missing: string[];
    present: string[];
  };
  competitorAnalysis: {
    ranking: number;
    totalCandidates: number;
    topSkills: string[];
  };
  marketTrends: {
    salary: { min: number; max: number; average: number };
    demand: number;
    growth: number;
  };
}

export const ResumeAnalytics: React.FC<ResumeAnalyticsProps> = ({
  resume,
  className = ""
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    generateAnalytics();
  }, [resume]);

  const generateAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate completion score
      const completionScore = calculateCompletionScore(resume);
      
      // Simulate AI-powered analytics (in real implementation, call AI service)
      const mockAnalytics: AnalyticsData = {
        completionScore,
        atsScore: Math.min(85 + Math.random() * 15, 100),
        readabilityScore: Math.min(78 + Math.random() * 22, 100),
        successPrediction: Math.min(72 + Math.random() * 28, 100),
        views: Math.floor(Math.random() * 150) + 50,
        downloads: Math.floor(Math.random() * 45) + 15,
        applications: Math.floor(Math.random() * 25) + 5,
        interviews: Math.floor(Math.random() * 8) + 2,
        strengths: [
          'Strong technical skills',
          'Consistent career progression',
          'Well-formatted content',
          'Quantified achievements'
        ],
        weaknesses: [
          'Could use more specific metrics',
          'Summary could be more compelling',
          'Missing some trending keywords'
        ],
        suggestions: [
          'Add more action verbs in experience descriptions',
          'Include specific project outcomes with numbers',
          'Optimize for ATS by using standard section headers',
          'Add relevant certifications for your field'
        ],
        keywordMatch: {
          score: Math.min(65 + Math.random() * 35, 100),
          missing: ['Machine Learning', 'Cloud Computing', 'DevOps'],
          present: ['React', 'TypeScript', 'Node.js', 'Python']
        },
        competitorAnalysis: {
          ranking: Math.floor(Math.random() * 15) + 5,
          totalCandidates: Math.floor(Math.random() * 80) + 120,
          topSkills: ['React', 'Python', 'AWS', 'Docker', 'Machine Learning']
        },
        marketTrends: {
          salary: {
            min: 80000,
            max: 150000,
            average: 115000
          },
          demand: Math.min(75 + Math.random() * 25, 100),
          growth: Math.min(12 + Math.random() * 18, 30)
        }
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error generating analytics:', error);
      toast.error('Failed to generate analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletionScore = (resume: EditorResume): number => {
    let score = 0;
    const checks = [
      { condition: resume.personalInfo.fullName.length > 0, points: 10 },
      { condition: resume.personalInfo.email.length > 0, points: 10 },
      { condition: resume.personalInfo.phone.length > 0, points: 5 },
      { condition: resume.personalInfo.summary.length > 50, points: 15 },
      { condition: resume.experience.length > 0, points: 20 },
      { condition: resume.education.length > 0, points: 15 },
      { condition: resume.skills.technical.length > 0, points: 10 },
      { condition: resume.projects.length > 0, points: 10 },
      { condition: resume.personalInfo.linkedin.length > 0, points: 5 }
    ];

    checks.forEach(check => {
      if (check.condition) score += check.points;
    });

    return score;
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await generateAnalytics();
    setRefreshing(false);
    toast.success('Analytics refreshed!');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
              <div>Analyzing your resume...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Failed to load analytics
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Resume Analytics</h3>
          <p className="text-muted-foreground">AI-powered insights for your resume</p>
        </div>
        <Button variant="outline" onClick={refreshAnalytics} disabled={refreshing}>
          <TrendingUp className="h-4 w-4 mr-2" />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className={`text-2xl font-bold ${getScoreColor(analytics.completionScore)}`}>
                  {analytics.completionScore}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={analytics.completionScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ATS Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(analytics.atsScore)}`}>
                  {Math.round(analytics.atsScore)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={analytics.atsScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Prediction</p>
                <p className={`text-2xl font-bold ${getScoreColor(analytics.successPrediction)}`}>
                  {Math.round(analytics.successPrediction)}%
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <Progress value={analytics.successPrediction} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Demand</p>
                <p className={`text-2xl font-bold ${getScoreColor(analytics.marketTrends.demand)}`}>
                  {Math.round(analytics.marketTrends.demand)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
            <Progress value={analytics.marketTrends.demand} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{analytics.views}</p>
            <p className="text-sm text-muted-foreground">Profile Views</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Download className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{analytics.downloads}</p>
            <p className="text-sm text-muted-foreground">Downloads</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{analytics.applications}</p>
            <p className="text-sm text-muted-foreground">Applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{analytics.interviews}</p>
            <p className="text-sm text-muted-foreground">Interviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths & Weaknesses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Strengths & Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                <div className="space-y-1">
                  {analytics.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-orange-600 mb-2">Areas for Improvement</h4>
                <div className="space-y-1">
                  {analytics.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">{weakness}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Market Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Salary Range</p>
                <p className="text-lg font-semibold">
                  ${analytics.marketTrends.salary.min.toLocaleString()} - ${analytics.marketTrends.salary.max.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Average: ${analytics.marketTrends.salary.average.toLocaleString()}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Your Ranking</p>
                <p className="text-lg font-semibold">
                  #{analytics.competitorAnalysis.ranking} of {analytics.competitorAnalysis.totalCandidates} candidates
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Top Skills in Market</p>
                <div className="flex flex-wrap gap-1">
                  {analytics.competitorAnalysis.topSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            AI-Powered Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Brain className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{suggestion}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};