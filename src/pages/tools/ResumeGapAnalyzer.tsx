import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BookOpen,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

const ResumeGapAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState({
    currentResume: '',
    targetJob: '',
    targetCompany: '',
    jobDescription: ''
  });
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);

  const analyzeGaps = async () => {
    if (!analysisData.currentResume.trim() || !analysisData.jobDescription.trim()) {
      toast.error('Please provide your current resume and target job description');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setGapAnalysis({
        overallMatch: 72,
        gaps: [
          {
            category: 'Technical Skills',
            severity: 'high',
            gaps: [
              {
                skill: 'Docker & Kubernetes',
                importance: 'Critical',
                timeline: '2-3 months',
                resources: ['Docker Documentation', 'Kubernetes Course', 'Hands-on Projects']
              },
              {
                skill: 'GraphQL',
                importance: 'Important',
                timeline: '1-2 months', 
                resources: ['GraphQL Tutorial', 'Apollo Documentation', 'Practice API']
              }
            ]
          },
          {
            category: 'Experience Areas',
            severity: 'medium',
            gaps: [
              {
                skill: 'Team Leadership',
                importance: 'Important',
                timeline: '3-6 months',
                resources: ['Leadership Training', 'Mentorship', 'Small Team Projects']
              },
              {
                skill: 'Agile/Scrum Certification',
                importance: 'Nice to have',
                timeline: '1 month',
                resources: ['Scrum.org Certification', 'Agile Training Course']
              }
            ]
          },
          {
            category: 'Industry Knowledge',
            severity: 'low',
            gaps: [
              {
                skill: 'FinTech Domain',
                importance: 'Important',
                timeline: '2-4 months',
                resources: ['FinTech Courses', 'Industry Reports', 'Networking Events']
              }
            ]
          }
        ],
        strengths: [
          'Strong JavaScript/React experience aligns perfectly',
          'Backend development experience is valuable',
          'Previous startup experience shows adaptability',
          'Problem-solving skills demonstrated through projects'
        ],
        recommendations: [
          {
            priority: 'immediate',
            action: 'Start Docker certification course this week',
            impact: 'High - addresses critical missing skill'
          },
          {
            priority: 'short-term',
            action: 'Build a GraphQL project for portfolio',
            impact: 'Medium - demonstrates practical knowledge'
          },
          {
            priority: 'medium-term',
            action: 'Take on leadership role in current position',
            impact: 'High - builds leadership credibility'
          }
        ]
      });
      setIsAnalyzing(false);
      toast.success('Gap analysis completed!');
    }, 4000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'immediate': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'short-term': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'medium-term': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Target className="h-8 w-8 text-orange-600" />
          Resume Gap Analyzer
        </h1>
        <p className="text-gray-600 mt-2">
          Identify skills and experience gaps between your resume and target job requirements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gap Analysis Input</CardTitle>
              <CardDescription>
                Provide your current resume and target job details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentResume">Current Resume Content *</Label>
                <Textarea
                  id="currentResume"
                  placeholder="Paste your current resume content here..."
                  value={analysisData.currentResume}
                  onChange={(e) => setAnalysisData(prev => ({ ...prev, currentResume: e.target.value }))}
                  rows={6}
                />
              </div>
              
              <div>
                <Label htmlFor="targetJob">Target Job Title</Label>
                <Input
                  id="targetJob"
                  placeholder="e.g., Senior Full Stack Developer"
                  value={analysisData.targetJob}
                  onChange={(e) => setAnalysisData(prev => ({ ...prev, targetJob: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="targetCompany">Target Company (Optional)</Label>
                <Input
                  id="targetCompany"
                  placeholder="e.g., Google, Microsoft"
                  value={analysisData.targetCompany}
                  onChange={(e) => setAnalysisData(prev => ({ ...prev, targetCompany: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="jobDescription">Job Description *</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the complete job description here..."
                  value={analysisData.jobDescription}
                  onChange={(e) => setAnalysisData(prev => ({ ...prev, jobDescription: e.target.value }))}
                  rows={6}
                />
              </div>

              <Button 
                onClick={analyzeGaps}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {isAnalyzing ? (
                  <>
                    <Target className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Gaps...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Analyze Gaps
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        <div>
          {gapAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Gap Analysis Results
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Match Score:</span>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {gapAnalysis.overallMatch}%
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="gaps" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="gaps">Gaps</TabsTrigger>
                    <TabsTrigger value="strengths">Strengths</TabsTrigger>  
                    <TabsTrigger value="action-plan">Action Plan</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="gaps" className="space-y-4">
                    <Progress value={gapAnalysis.overallMatch} className="w-full mb-4" />
                    {gapAnalysis.gaps.map((category: any, index: number) => (
                      <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(category.severity)}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{category.category}</h4>
                          <Badge variant="outline">
                            {category.severity} priority
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {category.gaps.map((gap: any, i: number) => (
                            <div key={i} className="bg-white rounded p-3 border">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">{gap.skill}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {gap.importance}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                <Clock className="h-3 w-3 inline mr-1" />
                                Timeline: {gap.timeline}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {gap.resources.map((resource: string, j: number) => (
                                  <Badge key={j} variant="outline" className="text-xs">
                                    {resource}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="strengths" className="space-y-3">
                    {gapAnalysis.strengths.map((strength: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{strength}</span>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="action-plan" className="space-y-3">
                    {gapAnalysis.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          {getPriorityIcon(rec.priority)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium capitalize">{rec.priority}</span>
                              <Badge variant="outline" className="text-xs">
                                {rec.priority}
                              </Badge>
                            </div>
                            <p className="text-gray-700 mb-2">{rec.action}</p>
                            <p className="text-sm text-gray-600">{rec.impact}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {!gapAnalysis && !isAnalyzing && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze</h3>
                <p className="text-gray-600 text-center">
                  Upload your resume and target job description to identify gaps and create an action plan
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeGapAnalyzer;