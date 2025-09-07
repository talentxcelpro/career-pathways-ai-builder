import { useState, useEffect } from 'react';
import { Target, CheckCircle, XCircle, AlertCircle, FileText, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface ATSCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  passed: boolean;
  score: number;
  suggestions: string[];
}

interface ATSReport {
  overallScore: number;
  passRate: number;
  criteria: ATSCriteria[];
  recommendations: string[];
  companyCompatibility: {
    name: string;
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
  }[];
}

interface ATSScoringProps {
  resumeText: string;
  jobDescription?: string;
  onOptimize?: (suggestions: string[]) => void;
}

export const ATSScoring = ({ resumeText, jobDescription, onOptimize }: ATSScoringProps) => {
  const [report, setReport] = useState<ATSReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState<string | null>(null);

  const mockAnalyzeResume = async (): Promise<ATSReport> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const criteria: ATSCriteria[] = [
      {
        id: 'keywords',
        name: 'Keyword Optimization',
        description: 'Resume contains relevant keywords from job description',
        weight: 25,
        passed: resumeText.length > 500,
        score: Math.min(95, Math.floor((resumeText.length / 10) + Math.random() * 20)),
        suggestions: [
          'Include more industry-specific keywords',
          'Add technical skills mentioned in job posting',
          'Use action verbs like "implemented", "optimized", "led"'
        ]
      },
      {
        id: 'formatting',
        name: 'ATS-Friendly Formatting',
        description: 'Resume uses clean, scannable formatting',
        weight: 20,
        passed: true,
        score: 92,
        suggestions: [
          'Use standard section headings',
          'Avoid complex layouts and graphics',
          'Stick to common fonts like Arial or Calibri'
        ]
      },
      {
        id: 'contact',
        name: 'Contact Information',
        description: 'Complete and properly formatted contact details',
        weight: 15,
        passed: resumeText.includes('@'),
        score: resumeText.includes('@') ? 98 : 45,
        suggestions: [
          'Include phone number',
          'Add professional email address',
          'Include LinkedIn profile URL'
        ]
      },
      {
        id: 'experience',
        name: 'Work Experience',
        description: 'Relevant work experience with quantifiable achievements',
        weight: 20,
        passed: resumeText.includes('experience') || resumeText.includes('worked'),
        score: 88,
        suggestions: [
          'Add specific metrics and numbers',
          'Include relevant job titles',
          'Describe achievements, not just responsibilities'
        ]
      },
      {
        id: 'skills',
        name: 'Skills Section',
        description: 'Technical and soft skills relevant to the position',
        weight: 10,
        passed: resumeText.includes('skill') || resumeText.includes('technology'),
        score: 85,
        suggestions: [
          'List programming languages',
          'Include software proficiencies',
          'Add relevant certifications'
        ]
      },
      {
        id: 'length',
        name: 'Resume Length',
        description: 'Optimal length for ATS processing',
        weight: 10,
        passed: resumeText.length > 300 && resumeText.length < 5000,
        score: resumeText.length > 300 && resumeText.length < 5000 ? 90 : 65,
        suggestions: [
          'Keep to 1-2 pages maximum',
          'Be concise but comprehensive',
          'Remove outdated or irrelevant information'
        ]
      }
    ];

    const overallScore = criteria.reduce((acc, c) => acc + (c.score * c.weight / 100), 0);
    const passRate = (criteria.filter(c => c.passed).length / criteria.length) * 100;

    return {
      overallScore: Math.round(overallScore),
      passRate: Math.round(passRate),
      criteria,
      recommendations: [
        'Focus on quantifiable achievements',
        'Tailor keywords to match job description',
        'Use a clean, professional format',
        'Include relevant technical skills',
        'Proofread for spelling and grammar'
      ],
      companyCompatibility: [
        { name: 'Google', score: 94, status: 'excellent' },
        { name: 'Microsoft', score: 91, status: 'excellent' },
        { name: 'Amazon', score: 87, status: 'good' },
        { name: 'Meta', score: 89, status: 'good' },
        { name: 'Apple', score: 85, status: 'good' },
        { name: 'Netflix', score: 82, status: 'fair' }
      ]
    };
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      toast.error('Please provide resume content to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await mockAnalyzeResume();
      setReport(result);
      toast.success('ATS analysis completed!');
    } catch (error) {
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getCompanyStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    if (resumeText.trim()) {
      analyzeResume();
    }
  }, [resumeText]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            ATS Compatibility Score
          </CardTitle>
          <CardDescription>
            Advanced analysis of how well your resume performs with Applicant Tracking Systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!report && !isAnalyzing ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Add resume content to get ATS compatibility analysis
              </p>
              <Button onClick={analyzeResume} disabled={!resumeText.trim()}>
                <Target className="h-4 w-4 mr-2" />
                Analyze Resume
              </Button>
            </div>
          ) : isAnalyzing ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 animate-pulse text-primary" />
              </div>
              <p className="text-lg font-medium mb-2">Analyzing your resume...</p>
              <p className="text-sm text-muted-foreground">
                Checking ATS compatibility across multiple systems
              </p>
              <div className="mt-4 w-64 mx-auto">
                <Progress value={75} className="animate-pulse" />
              </div>
            </div>
          ) : report ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="criteria">Detailed Analysis</TabsTrigger>
                <TabsTrigger value="compatibility">Company Match</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className={`text-4xl font-bold mb-2 ${getScoreColor(report.overallScore)}`}>
                          {report.overallScore}%
                        </div>
                        <p className="text-sm text-muted-foreground">Overall ATS Score</p>
                        <Badge variant={getScoreBadgeVariant(report.overallScore)} className="mt-2">
                          {report.overallScore >= 90 ? 'Excellent' : 
                           report.overallScore >= 70 ? 'Good' : 'Needs Improvement'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className={`text-4xl font-bold mb-2 ${getScoreColor(report.passRate)}`}>
                          {report.passRate}%
                        </div>
                        <p className="text-sm text-muted-foreground">Criteria Passed</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {report.criteria.filter(c => c.passed).length} of {report.criteria.length} checks
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {report.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                    {onOptimize && (
                      <Button 
                        className="w-full mt-4"
                        onClick={() => onOptimize(report.recommendations)}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Auto-Optimize Resume
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="criteria" className="space-y-4">
                {report.criteria.map((criteria) => (
                  <Card 
                    key={criteria.id}
                    className={`cursor-pointer transition-all ${
                      selectedCriteria === criteria.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedCriteria(
                      selectedCriteria === criteria.id ? null : criteria.id
                    )}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(criteria.passed)}
                          <div>
                            <h3 className="font-semibold">{criteria.name}</h3>
                            <p className="text-sm text-muted-foreground">{criteria.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(criteria.score)}`}>
                            {criteria.score}%
                          </div>
                          <p className="text-xs text-muted-foreground">Weight: {criteria.weight}%</p>
                        </div>
                      </div>
                      
                      <Progress value={criteria.score} className="mb-3" />
                      
                      {selectedCriteria === criteria.id && (
                        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium mb-2">Suggestions:</h4>
                          <ul className="space-y-1">
                            {criteria.suggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="compatibility" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Company ATS Compatibility</CardTitle>
                    <CardDescription>
                      How well your resume performs with different company ATS systems
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.companyCompatibility.map((company, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {company.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{company.name}</h3>
                              <Badge 
                                className={`text-xs ${getCompanyStatusColor(company.status)}`}
                                variant="outline"
                              >
                                {company.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${getScoreColor(company.score)}`}>
                              {company.score}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};