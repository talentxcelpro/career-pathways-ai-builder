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
  PieChart, 
  FileText, 
  Search, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Save,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ResumePerformanceInsights = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('resume-performance-insights', 'Resume Performance Insights');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    try {
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const mockResult = {
        ats_score: 78,
        overall_grade: 'B+',
        keyword_analysis: {
          matched_keywords: 18,
          total_keywords: 25,
          missing_keywords: ['Python', 'AWS', 'Machine Learning', 'Agile', 'Docker', 'SQL', 'Git']
        },
        sections_analysis: [
          { section: 'Contact Information', score: 95, status: 'excellent', issues: [] },
          { section: 'Professional Summary', score: 82, status: 'good', issues: ['Too generic', 'Add quantified achievements'] },
          { section: 'Work Experience', score: 75, status: 'good', issues: ['Missing action verbs', 'Add more metrics'] },
          { section: 'Skills', score: 68, status: 'needs_improvement', issues: ['Missing key technologies', 'Organize by category'] },
          { section: 'Education', score: 90, status: 'excellent', issues: [] },
          { section: 'Formatting', score: 85, status: 'good', issues: ['Inconsistent spacing', 'Use bullet points consistently'] }
        ],
        top_issues: [
          'Missing 7 critical keywords that appear in 80% of target job descriptions',
          'Professional summary lacks quantified achievements and impact metrics',
          'Work experience section could benefit from more action-oriented language',
          'Skills section needs better organization and missing in-demand technologies'
        ],
        recommendations: [
          'Add Python, AWS, and Machine Learning to your skills section',
          'Include specific metrics in your professional summary (e.g., "increased efficiency by 25%")',
          'Start bullet points with strong action verbs (managed, developed, implemented)',
          'Reorganize skills into categories: Technical, Soft Skills, Certifications',
          'Ensure consistent formatting throughout the document'
        ],
        industry_comparison: {
          average_ats_score: 65,
          your_ranking: 'Above Average',
          percentile: 72
        }
      };

      setAnalysisResult(mockResult);

      if (usageId) {
        await updateToolUsage(usageId, mockResult, 'completed', 150);
      }

      toast.success('Resume analysis complete!');
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
      'resume-performance-insights',
      'Resume Performance Analysis',
      analysisResult,
      'analysis',
      ['resume', 'ats', 'performance', 'keywords']
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs_improvement': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <TrendingUp className="h-4 w-4" />;
      case 'needs_improvement': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const renderAnalysis = () => {
    if (!analysisResult) return null;

    return (
      <div className="space-y-6">
        {/* Overview Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              ATS Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-primary mb-2">{analysisResult.ats_score}/100</div>
              <Badge variant="outline" className="text-lg px-4 py-1">{analysisResult.overall_grade}</Badge>
            </div>
            <Progress value={analysisResult.ats_score} className="h-4 mb-4" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Industry Average</div>
                <div className="font-semibold">{analysisResult.industry_comparison.average_ats_score}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Your Ranking</div>
                <div className="font-semibold">{analysisResult.industry_comparison.your_ranking}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Percentile</div>
                <div className="font-semibold">{analysisResult.industry_comparison.percentile}th</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keyword Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Keyword Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analysisResult.keyword_analysis.matched_keywords}</div>
                <div className="text-sm text-muted-foreground">Keywords Matched</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{analysisResult.keyword_analysis.missing_keywords.length}</div>
                <div className="text-sm text-muted-foreground">Missing Keywords</div>
              </div>
            </div>
            <Separator className="my-4" />
            <div>
              <h4 className="font-semibold mb-3">Missing High-Impact Keywords:</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.keyword_analysis.missing_keywords.map((keyword: string, index: number) => (
                  <Badge key={index} variant="destructive">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Section-by-Section Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisResult.sections_analysis.map((section: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{section.section}</span>
                      <Badge className={getStatusColor(section.status)}>
                        {getStatusIcon(section.status)}
                        {section.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">{section.score}/100</span>
                    </div>
                  </div>
                  <Progress value={section.score} className="h-2 mb-3" />
                  {section.issues.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Issues to Address:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {section.issues.map((issue: string, issueIndex: number) => (
                          <li key={issueIndex} className="flex items-start gap-2">
                            <span className="text-orange-500">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Priority Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysisResult.top_issues.map((issue: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{issue}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Improvement Recommendations
            </CardTitle>
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
                  <PieChart className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Resume Performance Insights</h2>
                  <p className="text-muted-foreground mb-6">
                    Analyze how your resume ranks in ATS systems with detailed keyword analysis
                  </p>
                </div>

                {isAnalyzing ? (
                  <div className="py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Analyzing Your Resume</h3>
                    <p className="text-muted-foreground">
                      Scanning for keywords and ATS optimization...
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleAnalyze} size="lg" className="px-8">
                    <FileText className="h-5 w-5 mr-2" />
                    Analyze Resume Performance
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

export default ResumePerformanceInsights;