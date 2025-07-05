import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingDown, 
  Users, 
  FileText,
  CheckCircle,
  Save,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const JobApplicationFunnel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('job-application-funnel', 'Job Application Funnel');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    try {
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        totalApplications: 45,
        interviews: 8,
        offers: 2,
        stages: [
          { name: 'Applications Sent', count: 45, percentage: 100, color: 'bg-blue-500' },
          { name: 'Profile Viewed', count: 28, percentage: 62, color: 'bg-green-500' },
          { name: 'Initial Screening', count: 15, percentage: 33, color: 'bg-yellow-500' },
          { name: 'Interviews', count: 8, percentage: 18, color: 'bg-orange-500' },
          { name: 'Final Round', count: 4, percentage: 9, color: 'bg-purple-500' },
          { name: 'Offers', count: 2, percentage: 4, color: 'bg-red-500' }
        ],
        insights: [
          'Your application-to-interview rate (18%) is above average (12%)',
          'Profile view rate suggests strong resume optimization',
          'Interview-to-offer conversion (25%) is excellent',
          'Consider applying to more positions to increase absolute offers'
        ],
        recommendations: [
          'Target 15-20 applications per week for optimal results',
          'Focus on companies with 100-500 employees for higher response rates',
          'Apply within first 3 days of job posting for 3x better visibility',
          'Customize your application for each role to improve screening rate'
        ]
      };

      setAnalysisResult(mockResult);

      if (usageId) {
        await updateToolUsage(usageId, mockResult, 'completed', 120);
      }

      toast.success('Funnel analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
      if (usageId) {
        await updateToolUsage(usageId, {}, 'failed', 0);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveResult = async () => {
    if (!analysisResult) return;
    
    await saveToolResult(
      'job-application-funnel',
      'Job Application Funnel Analysis',
      analysisResult,
      'analysis',
      ['analytics', 'applications', 'funnel']
    );
  };

  const renderAnalysis = () => {
    if (!analysisResult) return null;

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analysisResult.totalApplications}</div>
              <div className="text-sm text-muted-foreground">Applications Sent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analysisResult.interviews}</div>
              <div className="text-sm text-muted-foreground">Interviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analysisResult.offers}</div>
              <div className="text-sm text-muted-foreground">Offers Received</div>
            </CardContent>
          </Card>
        </div>

        {/* Funnel Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Application Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisResult.stages.map((stage: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{stage.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{stage.count}</span>
                      <Badge variant="outline">{stage.percentage}%</Badge>
                    </div>
                  </div>
                  <Progress value={stage.percentage} className="h-3" />
                  {index < analysisResult.stages.length - 1 && (
                    <div className="flex items-center justify-center py-2">
                      <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysisResult.insights.map((insight: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysisResult.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSaveResult} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Analysis
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/tools')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            {!analysisResult ? (
              <div className="text-center space-y-6">
                <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Job Application Funnel</h2>
                  <p className="text-muted-foreground mb-6">
                    Analyze your job application pipeline with drop-off analysis at each stage
                  </p>
                </div>

                {isAnalyzing ? (
                  <div className="py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Analyzing Your Pipeline</h3>
                    <p className="text-muted-foreground">
                      Processing your application data...
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleAnalyze} size="lg" className="px-8">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Analyze Application Funnel
                  </Button>
                )}
              </div>
            ) : (
              renderAnalysis()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobApplicationFunnel;