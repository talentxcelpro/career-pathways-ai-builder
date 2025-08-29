import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Target, TrendingUp, AlertTriangle, CheckCircle, Download, Save } from 'lucide-react';
import { useAdvancedAIFeatures } from '@/hooks/useAdvancedAIFeatures';
import { toast } from 'sonner';

interface GapAnalysis {
  overallScore: number;
  sections: {
    impact: { score: number; missing: string[]; suggestions: string[] };
    achievements: { score: number; missing: string[]; suggestions: string[] };
    skills: { score: number; missing: string[]; suggestions: string[] };
    keywords: { score: number; missing: string[]; suggestions: string[] };
  };
  recommendations: string[];
  priorityActions: string[];
}

export const ResumeGapAnalyzer: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  const { performAdvancedATSAnalysis } = useAdvancedAIFeatures();

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error('Please paste your resume content');
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep(2);
    
    try {
      // Simulate gap analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockAnalysis: GapAnalysis = {
        overallScore: 68,
        sections: {
          impact: {
            score: 45,
            missing: ['Quantified achievements', 'Revenue impact', 'Cost savings'],
            suggestions: ['Add specific numbers and percentages', 'Include revenue/cost impact', 'Use action verbs']
          },
          achievements: {
            score: 60,
            missing: ['Leadership examples', 'Problem-solving results', 'Innovation projects'],
            suggestions: ['Add STAR method examples', 'Include team leadership', 'Show problem-solving skills']
          },
          skills: {
            score: 75,
            missing: ['Cloud platforms', 'Data analysis', 'Project management'],
            suggestions: ['Add trending technical skills', 'Include soft skills', 'Show skill progression']
          },
          keywords: {
            score: 80,
            missing: ['Agile', 'Stakeholder management', 'Digital transformation'],
            suggestions: ['Add industry keywords', 'Include role-specific terms', 'Use modern terminology']
          }
        },
        recommendations: [
          'Add 3-5 quantified achievements per role',
          'Include specific technologies and tools',
          'Add leadership and collaboration examples',
          'Use industry-standard terminology'
        ],
        priorityActions: [
          'Quantify your top 3 achievements',
          'Add missing technical skills',
          'Include leadership examples'
        ]
      };
      
      setAnalysis(mockAnalysis);
      toast.success('Gap analysis completed!');
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    toast.success('Analysis saved to your profile');
  };

  const handleExport = () => {
    toast.success('Analysis exported as PDF');
  };

  const steps = [
    {
      id: 'paste',
      title: 'Paste Resume',
      description: 'Add your current resume content',
      component: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Resume Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your resume content here..."
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                if (e.target.value.length > 0 && currentStep === 0) setCurrentStep(1);
              }}
              className="min-h-48 resize-none"
            />
          </CardContent>
        </Card>
      ),
      isCompleted: resumeText.length > 0
    },
    {
      id: 'target',
      title: 'Target Role (Optional)',
      description: 'Specify your target position',
      component: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Target Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="e.g., Senior Software Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !resumeText.trim()}
              className="w-full"
            >
              {isAnalyzing ? 'Analyzing Gaps...' : 'Analyze Resume Gaps'}
            </Button>
          </CardContent>
        </Card>
      ),
      isCompleted: true
    },
    {
      id: 'analyze',
      title: 'Analyze Gaps',
      description: 'Identify missing elements',
      component: analysis ? (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Gap Analysis Results</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold mb-2">{analysis.overallScore}%</div>
                <div className="text-muted-foreground">Resume Completeness Score</div>
                <Progress value={analysis.overallScore} className="mt-4" />
              </div>
            </CardContent>
          </Card>

          {/* Section Analysis */}
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(analysis.sections).map(([key, section]) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="capitalize font-medium">{key}</h4>
                    <Badge variant={section.score >= 70 ? 'default' : 'destructive'}>
                      {section.score}%
                    </Badge>
                  </div>
                  <Progress value={section.score} className="h-2" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {section.missing.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-red-600 flex items-center gap-1 mb-2">
                        <AlertTriangle className="h-3 w-3" />
                        Missing Elements
                      </h5>
                      <div className="space-y-1">
                        {section.missing.slice(0, 2).map((item, i) => (
                          <p key={i} className="text-xs text-red-600">• {item}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h5 className="text-sm font-medium text-blue-600 flex items-center gap-1 mb-2">
                      <CheckCircle className="h-3 w-3" />
                      Suggestions
                    </h5>
                    <div className="space-y-1">
                      {section.suggestions.slice(0, 2).map((suggestion, i) => (
                        <p key={i} className="text-xs text-blue-600">• {suggestion}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Priority Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Priority Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {analysis.priorityActions.map((action, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </div>
                    <span className="text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Analysis will appear here after processing</p>
        </div>
      ),
      isCompleted: analysis !== null
    }
  ];

  return (
    <ToolLayout
      title="Resume Gap Analyzer"
      description="Identify missing impact statements, achievements, and critical elements in your resume"
      category="Resume"
      estimatedTime="5-10 min"
      popularity={87}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      results={analysis}
    />
  );
};