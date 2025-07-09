import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, CheckCircle, AlertCircle, XCircle, 
  Zap, FileText, Search, Target 
} from "lucide-react";

interface ATSScoreCheckerProps {
  resumeContent: any;
  currentScore?: number;
  onScoreUpdate: (score: number) => void;
}

export const ATSScoreChecker = ({ resumeContent, currentScore = 0, onScoreUpdate }: ATSScoreCheckerProps) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const calculateATSScore = () => {
    if (!resumeContent) return 0;

    let score = 0;
    const content = resumeContent;

    // Basic Information (30 points)
    if (content.personalInfo?.fullName) score += 8;
    if (content.personalInfo?.email) score += 6;
    if (content.personalInfo?.phone) score += 6;
    if (content.personalInfo?.location) score += 5;
    if (content.personalInfo?.summary && content.personalInfo.summary.length > 50) score += 5;

    // Experience Section (25 points)
    if (content.experience?.length > 0) {
      score += 15;
      // Bonus for multiple experiences
      if (content.experience.length > 1) score += 5;
      // Bonus for detailed descriptions
      const hasDetailedExperience = content.experience.some((exp: any) => 
        exp.description && exp.description.length > 100
      );
      if (hasDetailedExperience) score += 5;
    }

    // Education Section (15 points)
    if (content.education?.length > 0) {
      score += 10;
      // Bonus for complete education info
      const hasCompleteEducation = content.education.some((edu: any) => 
        edu.degree && edu.school && edu.startDate && edu.endDate
      );
      if (hasCompleteEducation) score += 5;
    }

    // Skills Section (20 points)
    if (content.skills?.technical?.length > 0) {
      score += 10;
      // Bonus for comprehensive skills
      if (content.skills.technical.length >= 5) score += 5;
      if (content.skills.soft?.length > 0) score += 3;
      if (content.skills.tools?.length > 0) score += 2;
    }

    // Additional Sections (10 points)
    if (content.projects?.length > 0) score += 5;
    if (content.certifications?.length > 0) score += 3;
    if (content.personalInfo?.linkedin) score += 2;

    return Math.min(score, 100);
  };

  const runATSAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call for detailed analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const score = calculateATSScore();
    const mockAnalysis = {
      overall_score: score,
      keyword_score: Math.max(score - 10, 0),
      formatting_score: Math.min(score + 5, 100),
      content_score: score,
      recommendations: [
        {
          category: 'Contact Information',
          issue: 'Missing LinkedIn profile',
          suggestion: 'Add your LinkedIn profile URL to improve professional presence',
          priority: 'medium',
          impact: 5
        },
        {
          category: 'Experience',
          issue: 'Descriptions could be more detailed',
          suggestion: 'Add quantifiable achievements and specific metrics to your experience descriptions',
          priority: 'high',
          impact: 10
        },
        {
          category: 'Skills',
          issue: 'Limited technical skills listed',
          suggestion: 'Include more relevant technical skills for your target role',
          priority: 'medium',
          impact: 8
        }
      ],
      missing_keywords: jobDescription ? ['leadership', 'project management', 'stakeholder'] : [],
      flagged_issues: [
        {
          type: 'formatting',
          message: 'Consider using bullet points for better readability',
          severity: 'low'
        }
      ]
    };

    setAnalysis(mockAnalysis);
    onScoreUpdate(score);
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 70) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const currentATSScore = analysis?.overall_score || currentScore || calculateATSScore();

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall ATS Score</p>
                <div className="flex items-center space-x-2">
                  {getScoreIcon(currentATSScore)}
                  <span className={`text-2xl font-bold ${getScoreColor(currentATSScore)}`}>
                    {currentATSScore}%
                  </span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={currentATSScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Keyword Match</p>
                <span className="text-2xl font-bold text-blue-600">
                  {analysis?.keyword_score || Math.max(currentATSScore - 10, 0)}%
                </span>
              </div>
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={analysis?.keyword_score || Math.max(currentATSScore - 10, 0)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Formatting</p>
                <span className="text-2xl font-bold text-green-600">
                  {analysis?.formatting_score || Math.min(currentATSScore + 5, 100)}%
                </span>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={analysis?.formatting_score || Math.min(currentATSScore + 5, 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Content Quality</p>
                <span className="text-2xl font-bold text-purple-600">
                  {analysis?.content_score || currentATSScore}%
                </span>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={analysis?.content_score || currentATSScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Job Description Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Job Description Analysis</CardTitle>
          <CardDescription>
            Paste a job description to get targeted recommendations for your resume
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste the job description here to get personalized ATS recommendations..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
          />
          <Button 
            onClick={runATSAnalysis}
            disabled={isAnalyzing}
            className="w-full"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Run ATS Analysis'}
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Improve your ATS score with these suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {analysis.recommendations?.map((rec: any, index: number) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{rec.category}</h4>
                  <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                    {rec.priority} priority
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{rec.issue}</p>
                <p className="text-sm font-medium text-green-600">{rec.suggestion}</p>
                <p className="text-xs text-muted-foreground mt-1">Impact: +{rec.impact} points</p>
              </div>
            ))}

            {analysis.missing_keywords && analysis.missing_keywords.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing_keywords.map((keyword: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Consider incorporating these keywords from the job description into your resume
                  </p>
                </div>
              </>
            )}

            {analysis.flagged_issues && analysis.flagged_issues.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Formatting Issues</h4>
                  <div className="space-y-2">
                    {analysis.flagged_issues.map((issue: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{issue.message}</span>
                        <Badge variant="outline" className="text-xs">
                          {issue.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>ATS Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✓ ATS-Friendly Practices</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use standard section headings</li>
                <li>• Include relevant keywords</li>
                <li>• Use simple, clean formatting</li>
                <li>• Save as .docx or .pdf</li>
                <li>• Include contact information</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-red-600">✗ Avoid These Elements</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Headers and footers</li>
                <li>• Tables and columns</li>
                <li>• Graphics and images</li>
                <li>• Unusual fonts</li>
                <li>• Text boxes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};