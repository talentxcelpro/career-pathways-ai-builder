
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Target, Upload, Zap, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { EnhancedResumeData } from '@/types/enhanced-resume';

interface ATSOptimizerProps {
  resumeData: EnhancedResumeData;
  onOptimize: (data: Partial<EnhancedResumeData>) => void;
  atsScore: number;
  suggestions: any[];
}

interface JobAnalysis {
  keywords: string[];
  requiredSkills: string[];
  experienceLevel: string;
  industryTags: string[];
  matchScore: number;
  missingKeywords: string[];
  suggestions: string[];
}

interface ATSCompatibilityCheck {
  formatScore: number;
  keywordScore: number;
  structureScore: number;
  readabilityScore: number;
  overallScore: number;
  issues: Array<{
    type: 'critical' | 'warning' | 'suggestion';
    message: string;
    fix: string;
  }>;
}

export const ATSOptimizer: React.FC<ATSOptimizerProps> = ({
  resumeData,
  onOptimize,
  atsScore,
  suggestions
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);
  const [compatibilityCheck, setCompatibilityCheck] = useState<ATSCompatibilityCheck | null>(null);

  const analyzeJobPosting = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate job analysis - in real implementation, this would call AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis: JobAnalysis = {
        keywords: ['React', 'TypeScript', 'Node.js', 'AWS', 'Agile', 'JavaScript', 'API', 'CI/CD'],
        requiredSkills: ['Frontend Development', 'Backend Development', 'Cloud Computing', 'Team Leadership'],
        experienceLevel: '5-7 years',
        industryTags: ['Technology', 'SaaS', 'Startup'],
        matchScore: 78,
        missingKeywords: ['AWS', 'CI/CD', 'Team Leadership', 'Agile'],
        suggestions: [
          'Add AWS experience to your skills section',
          'Mention CI/CD experience in your project descriptions',
          'Highlight team leadership experience in your work history',
          'Include Agile methodology experience'
        ]
      };
      
      setJobAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Failed to analyze job posting:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runCompatibilityCheck = async () => {
    const mockCheck: ATSCompatibilityCheck = {
      formatScore: 95,
      keywordScore: 72,
      structureScore: 88,
      readabilityScore: 85,
      overallScore: atsScore,
      issues: [
        {
          type: 'warning',
          message: 'Missing key industry keywords',
          fix: 'Add more relevant keywords from the job description'
        },
        {
          type: 'suggestion',
          message: 'Experience section could be more quantified',
          fix: 'Add specific metrics and numbers to your achievements'
        },
        {
          type: 'critical',
          message: 'Skills section needs technical keywords',
          fix: 'Include specific programming languages and tools'
        }
      ]
    };
    
    setCompatibilityCheck(mockCheck);
  };

  const applyOptimization = (optimization: string) => {
    console.log('Applying optimization:', optimization);
    // Implementation would update resume data based on optimization
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 85) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            ATS Optimization Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className={`text-3xl font-bold ${getScoreColor(atsScore)}`}>
              {atsScore}%
            </div>
            <Button onClick={runCompatibilityCheck} variant="outline" size="sm">
              <Zap className="w-4 h-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>
          <Progress value={atsScore} className="w-full" />
          <p className="text-sm text-gray-600 mt-2">
            {atsScore >= 85 ? 'Excellent! Your resume is highly ATS-compatible.' :
             atsScore >= 70 ? 'Good, but there\'s room for improvement.' :
             'Needs optimization for better ATS compatibility.'}
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="job-match" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="job-match">Job Matching</TabsTrigger>
          <TabsTrigger value="compatibility">Compatibility Check</TabsTrigger>
          <TabsTrigger value="optimization">Quick Fixes</TabsTrigger>
        </TabsList>

        <TabsContent value="job-match" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Analyze Job Posting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Job Description URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://company.com/job-posting"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Or paste job description</label>
                <Textarea
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                />
              </div>
              
              <Button 
                onClick={analyzeJobPosting} 
                disabled={!jobDescription.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Job Match'}
              </Button>
            </CardContent>
          </Card>

          {jobAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  Job Match Analysis
                  <Badge className={getScoreBackground(jobAnalysis.matchScore)}>
                    {jobAnalysis.matchScore}% Match
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Required Keywords Found</h4>
                  <div className="flex flex-wrap gap-1">
                    {jobAnalysis.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {jobAnalysis.missingKeywords.map((keyword, index) => (
                      <Badge key={index} variant="destructive">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Optimization Suggestions</h4>
                  <div className="space-y-2">
                    {jobAnalysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm">{suggestion}</span>
                        <Button size="sm" onClick={() => applyOptimization(suggestion)}>
                          Apply
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="compatibility" className="space-y-4">
          {compatibilityCheck ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-xl font-bold ${getScoreColor(compatibilityCheck.formatScore)}`}>
                      {compatibilityCheck.formatScore}%
                    </div>
                    <div className="text-sm text-gray-600">Format</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-xl font-bold ${getScoreColor(compatibilityCheck.keywordScore)}`}>
                      {compatibilityCheck.keywordScore}%
                    </div>
                    <div className="text-sm text-gray-600">Keywords</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-xl font-bold ${getScoreColor(compatibilityCheck.structureScore)}`}>
                      {compatibilityCheck.structureScore}%
                    </div>
                    <div className="text-sm text-gray-600">Structure</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-xl font-bold ${getScoreColor(compatibilityCheck.readabilityScore)}`}>
                      {compatibilityCheck.readabilityScore}%
                    </div>
                    <div className="text-sm text-gray-600">Readability</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Issues & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {compatibilityCheck.issues.map((issue, index) => (
                      <Alert key={index} className={
                        issue.type === 'critical' ? 'border-red-200' :
                        issue.type === 'warning' ? 'border-yellow-200' :
                        'border-blue-200'
                      }>
                        <div className="flex items-start gap-3">
                          {issue.type === 'critical' ? 
                            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" /> :
                            issue.type === 'warning' ? 
                            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" /> :
                            <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                          }
                          <div className="flex-1">
                            <AlertDescription className="font-medium">
                              {issue.message}
                            </AlertDescription>
                            <p className="text-sm text-gray-600 mt-1">{issue.fix}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Fix
                          </Button>
                        </div>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Run a compatibility check to see detailed ATS analysis</p>
                <Button onClick={runCompatibilityCheck}>
                  Run Compatibility Check
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Optimization Fixes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm">{suggestion.title || 'Optimization Suggestion'}</h4>
                      <p className="text-sm text-gray-600">{suggestion.description || 'Improve your resume\'s ATS compatibility'}</p>
                    </div>
                    <Button size="sm" onClick={() => applyOptimization(suggestion.title || 'suggestion')}>
                      Apply
                    </Button>
                  </div>
                ))}
                
                {suggestions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>Great! No optimization suggestions at the moment.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
