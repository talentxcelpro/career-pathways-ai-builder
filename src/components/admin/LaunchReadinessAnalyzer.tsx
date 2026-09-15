import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Database, 
  Shield, 
  Zap,
  Code,
  Globe,
  Users,
  DollarSign
} from 'lucide-react';

interface AnalysisResult {
  category: string;
  score: number;
  issues: string[];
  suggestions: string[];
  critical: string[];
}

export const LaunchReadinessAnalyzer: React.FC = () => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallScore, setOverallScore] = useState(0);

  const runComprehensiveAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate comprehensive analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results: AnalysisResult[] = [
      {
        category: 'Security & Authentication',
        score: 85,
        issues: [
          '33+ hardcoded API keys found in admin components',
          'AuthSessionMissingError occurring on page load',
          'Some test components exposing Supabase keys'
        ],
        suggestions: [
          'Move all API keys to secure environment variables',
          'Implement proper auth error handling',
          'Add API key rotation mechanism'
        ],
        critical: [
          'Hardcoded API keys must be removed before production'
        ]
      },
      {
        category: 'Mock Data & Test Content',
        score: 70,
        issues: [
          '3,200+ instances of mock/test data found',
          '754+ INR currency references (should be TXC)',
          'Test placeholders in production components',
          'Sample data in email templates'
        ],
        suggestions: [
          'Implement production data detection',
          'Create data cleanup automation',
          'Replace all mock data with real content'
        ],
        critical: [
          'Remove all mock data before launch',
          'Complete INR to TXC currency conversion'
        ]
      },
      {
        category: 'Performance & Optimization',
        score: 92,
        issues: [
          '3,000+ console.log statements',
          'Some large bundle sizes in admin components'
        ],
        suggestions: [
          'Remove console statements in production',
          'Implement code splitting for admin routes',
          'Add lazy loading for heavy components'
        ],
        critical: []
      },
      {
        category: 'User Experience',
        score: 88,
        issues: [
          'No one-tap login implemented',
          'Some placeholder content visible',
          'Missing Google Auth configuration'
        ],
        suggestions: [
          'Implement Google One-Tap login',
          'Complete all content with real data',
          'Add social authentication options'
        ],
        critical: []
      },
      {
        category: 'Production Readiness',
        score: 82,
        issues: [
          'Service worker needs optimization',
          'SEO meta tags could be improved',
          'Missing analytics configuration'
        ],
        suggestions: [
          'Finalize service worker caching strategy',
          'Complete Google Analytics setup',
          'Add performance monitoring'
        ],
        critical: []
      }
    ];

    setAnalysisResults(results);
    const overall = Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length);
    setOverallScore(overall);
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 80) return 'secondary';
    return 'destructive';
  };

  const criticalIssuesCount = analysisResults.reduce((acc, r) => acc + r.critical.length, 0);
  const totalIssues = analysisResults.reduce((acc, r) => acc + r.issues.length, 0);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            TalentXcel Launch Readiness Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Overall Readiness Score</p>
              <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </div>
            </div>
            <Button 
              onClick={runComprehensiveAnalysis} 
              disabled={isAnalyzing}
              size="lg"
            >
              {isAnalyzing ? 'Analyzing...' : 'Run Full Analysis'}
            </Button>
          </div>
          
          {overallScore > 0 && (
            <>
              <Progress value={overallScore} className="mb-4" />
              
              {criticalIssuesCount > 0 && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{criticalIssuesCount} critical issues</strong> must be resolved before launch.
                    Total issues found: {totalIssues}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
            <TabsTrigger value="data" className="text-xs">Data Quality</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
            <TabsTrigger value="ux" className="text-xs">User Experience</TabsTrigger>
            <TabsTrigger value="production" className="text-xs">Production</TabsTrigger>
          </TabsList>

          {analysisResults.map((result, index) => (
            <TabsContent 
              key={index}
              value={['security', 'data', 'performance', 'ux', 'production'][index]}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {index === 0 && <Shield className="w-5 h-5" />}
                      {index === 1 && <Database className="w-5 h-5" />}
                      {index === 2 && <Zap className="w-5 h-5" />}
                      {index === 3 && <Users className="w-5 h-5" />}
                      {index === 4 && <Globe className="w-5 h-5" />}
                      {result.category}
                    </span>
                    <Badge variant={getScoreBadge(result.score)}>
                      {result.score}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.critical.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Critical Issues
                      </h4>
                      <ul className="space-y-1">
                        {result.critical.map((issue, i) => (
                          <li key={i} className="text-sm text-red-600 pl-4">
                            • {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-yellow-600 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Issues Found
                    </h4>
                    <ul className="space-y-1">
                      {result.issues.map((issue, i) => (
                        <li key={i} className="text-sm text-muted-foreground pl-4">
                          • {issue}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {result.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm text-muted-foreground pl-4">
                          • {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Action Items */}
      {overallScore > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Immediate Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Before Launch (Critical)</h4>
                <ul className="space-y-1 text-sm">
                  <li>🔒 Remove all hardcoded API keys</li>
                  <li>🧹 Clean up mock data and test content</li>
                  <li>💱 Complete INR to TXC conversion</li>
                  <li>🔧 Fix authentication session issues</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-600 mb-2">Post-Launch (Improvements)</h4>
                <ul className="space-y-1 text-sm">
                  <li>📊 Implement comprehensive analytics</li>
                  <li>⚡ Optimize performance monitoring</li>
                  <li>🎯 Add A/B testing framework</li>
                  <li>🔄 Set up automated backups</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Launch Recommendation */}
      {overallScore > 0 && (
        <Card className={overallScore >= 85 ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${overallScore >= 85 ? "text-green-600" : "text-yellow-600"}`}>
                {overallScore >= 85 ? "🚀 Ready for Soft Launch" : "⚠️ Needs Critical Fixes"}
              </div>
              <p className="text-muted-foreground">
                {overallScore >= 85 
                  ? "Your application is ready for a soft launch with close monitoring. Address remaining issues post-launch."
                  : `Complete critical fixes to reach launch readiness. Current blocker: ${criticalIssuesCount} critical issues.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};