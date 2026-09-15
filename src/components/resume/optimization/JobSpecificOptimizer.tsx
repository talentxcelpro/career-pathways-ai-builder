import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, TrendingUp, AlertTriangle, CheckCircle, 
  FileText, Zap, BarChart3, BrainCircuit 
} from 'lucide-react';

interface JobMatch {
  keyword: string;
  importance: 'high' | 'medium' | 'low';
  found: boolean;
  suggestions: string[];
}

interface ATSAnalysis {
  score: number;
  issues: string[];
  recommendations: string[];
  industryBenchmark: number;
}

interface JobSpecificOptimizerProps {
  resumeData: any;
  onOptimization: (optimizedData: any) => void;
}

export const JobSpecificOptimizer: React.FC<JobSpecificOptimizerProps> = ({
  resumeData,
  onOptimization
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    keywordMatches: JobMatch[];
    atsAnalysis: ATSAnalysis;
    recommendations: string[];
  } | null>(null);

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
    'Sales', 'Engineering', 'Design', 'Operations', 'Consulting'
  ];

  const handleAnalyzeJob = async () => {
    if (!jobDescription.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        keywordMatches: [
          {
            keyword: 'Python',
            importance: 'high' as const,
            found: true,
            suggestions: ['Add specific Python frameworks used', 'Include project examples']
          },
          {
            keyword: 'Machine Learning',
            importance: 'high' as const,
            found: false,
            suggestions: ['Add ML experience to skills', 'Include relevant projects']
          },
          {
            keyword: 'Team Leadership',
            importance: 'medium' as const,
            found: true,
            suggestions: ['Quantify team size managed', 'Add leadership achievements']
          }
        ],
        atsAnalysis: {
          score: 78,
          issues: ['Missing industry keywords', 'Inconsistent date formatting'],
          recommendations: ['Add more technical skills', 'Use standard date format'],
          industryBenchmark: 85
        },
        recommendations: [
          'Include more quantified achievements',
          'Add relevant technical skills mentioned in job posting',
          'Align experience descriptions with job requirements'
        ]
      };
      
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleOptimizeResume = () => {
    if (!analysis) return;
    
    // Apply optimizations to resume data
    const optimizedData = {
      ...resumeData,
      optimizations: {
        keywordDensity: analysis.keywordMatches,
        atsScore: analysis.atsAnalysis.score,
        appliedRecommendations: analysis.recommendations
      }
    };
    
    onOptimization(optimizedData);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Job Description Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Job Description Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Industry</Label>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select target industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry.toLowerCase()}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Job Description</Label>
            <Textarea
              placeholder="Paste the job description here to analyze keywords and requirements..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
            />
          </div>
          
          <Button 
            onClick={handleAnalyzeJob}
            disabled={!jobDescription.trim() || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <BrainCircuit className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Job Requirements...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Analyze & Optimize
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Optimization Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="keywords" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="ats">ATS Score</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="keywords" className="space-y-4">
                <h3 className="text-lg font-semibold">Keyword Analysis</h3>
                <div className="space-y-3">
                  {analysis.keywordMatches.map((match, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {match.found ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <span className="font-medium">{match.keyword}</span>
                          <Badge 
                            variant={match.importance === 'high' ? 'destructive' : 
                                   match.importance === 'medium' ? 'default' : 'secondary'}
                            className="ml-2"
                          >
                            {match.importance}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {match.suggestions.length} suggestions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ats" className="space-y-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(analysis.atsAnalysis.score)}`}>
                      {analysis.atsAnalysis.score}%
                    </div>
                    <div className="text-sm text-muted-foreground">ATS Compatibility Score</div>
                    <Progress value={analysis.atsAnalysis.score} className="mt-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-semibold text-muted-foreground">
                        {analysis.atsAnalysis.industryBenchmark}%
                      </div>
                      <div className="text-sm">Industry Average</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-semibold text-blue-600">
                        {analysis.atsAnalysis.issues.length}
                      </div>
                      <div className="text-sm">Issues Found</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Issues to Fix:</h4>
                    {analysis.atsAnalysis.issues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        {issue}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <h3 className="text-lg font-semibold">AI Recommendations</h3>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">{rec}</div>
                    </div>
                  ))}
                </div>
                
                <Button onClick={handleOptimizeResume} className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Apply Optimizations
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};