
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle, TrendingUp } from "lucide-react";

interface ATSScoreProps {
  resumeContent: any;
  jobDescription?: string;
}

interface ScoreMetric {
  name: string;
  score: number;
  maxScore: number;
  status: 'good' | 'warning' | 'poor';
  suggestions: string[];
}

export const ATSScoreCalculator = ({ resumeContent, jobDescription }: ATSScoreProps) => {
  const calculateATSScore = (): { totalScore: number; metrics: ScoreMetric[] } => {
    const { personalInfo = {}, experience = [], education = [], skills = [] } = resumeContent;
    
    const metrics: ScoreMetric[] = [
      {
        name: 'Contact Information',
        score: personalInfo.fullName && personalInfo.email && personalInfo.phone ? 20 : 10,
        maxScore: 20,
        status: personalInfo.fullName && personalInfo.email && personalInfo.phone ? 'good' : 'warning',
        suggestions: !personalInfo.fullName || !personalInfo.email || !personalInfo.phone 
          ? ['Add complete contact information including name, email, and phone number']
          : []
      },
      {
        name: 'Professional Summary',
        score: personalInfo.summary && personalInfo.summary.length > 50 ? 15 : personalInfo.summary ? 8 : 0,
        maxScore: 15,
        status: personalInfo.summary && personalInfo.summary.length > 50 ? 'good' : personalInfo.summary ? 'warning' : 'poor',
        suggestions: !personalInfo.summary 
          ? ['Add a professional summary to introduce yourself']
          : personalInfo.summary.length < 50 
          ? ['Expand your professional summary to be more detailed']
          : []
      },
      {
        name: 'Work Experience',
        score: experience.length >= 2 ? 25 : experience.length === 1 ? 15 : 0,
        maxScore: 25,
        status: experience.length >= 2 ? 'good' : experience.length === 1 ? 'warning' : 'poor',
        suggestions: experience.length === 0 
          ? ['Add work experience to strengthen your resume']
          : experience.length === 1 
          ? ['Consider adding more work experience entries']
          : []
      },
      {
        name: 'Skills Section',
        score: skills.length >= 5 ? 15 : skills.length >= 3 ? 10 : skills.length > 0 ? 5 : 0,
        maxScore: 15,
        status: skills.length >= 5 ? 'good' : skills.length >= 3 ? 'warning' : 'poor',
        suggestions: skills.length < 3 
          ? ['Add more relevant skills to improve keyword matching']
          : skills.length < 5 
          ? ['Consider adding more skills to reach optimal range']
          : []
      },
      {
        name: 'Education',
        score: education.length > 0 ? 10 : 0,
        maxScore: 10,
        status: education.length > 0 ? 'good' : 'poor',
        suggestions: education.length === 0 
          ? ['Add your education background']
          : []
      },
      {
        name: 'Formatting & Structure',
        score: 15, // Always good for our structured format
        maxScore: 15,
        status: 'good',
        suggestions: []
      }
    ];

    const totalScore = metrics.reduce((sum, metric) => sum + metric.score, 0);
    return { totalScore, metrics };
  };

  const { totalScore, metrics } = calculateATSScore();
  const maxTotalScore = metrics.reduce((sum, metric) => sum + metric.maxScore, 0);
  const scorePercentage = Math.round((totalScore / maxTotalScore) * 100);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (percentage: number) => {
    if (percentage >= 80) return { text: 'Excellent', color: 'bg-green-500' };
    if (percentage >= 60) return { text: 'Good', color: 'bg-yellow-500' };
    return { text: 'Needs Improvement', color: 'bg-red-500' };
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'poor': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const status = getScoreStatus(scorePercentage);
  const allSuggestions = metrics.flatMap(metric => metric.suggestions).filter(Boolean);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>ATS Compatibility Score</span>
          </CardTitle>
          <CardDescription>
            How well your resume performs with Applicant Tracking Systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(scorePercentage)}`}>
                {scorePercentage}%
              </div>
              <Badge className={status.color}>
                {status.text}
              </Badge>
            </div>
            
            <Progress value={scorePercentage} className="h-3" />
            
            <div className="text-sm text-center text-gray-600">
              {totalScore} out of {maxTotalScore} points
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
          <CardDescription>Detailed analysis of your resume components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={metric.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(metric.status)}
                  <div>
                    <div className="font-medium">{metric.name}</div>
                    <div className="text-sm text-gray-600">
                      {metric.score}/{metric.maxScore} points
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Progress 
                    value={(metric.score / metric.maxScore) * 100} 
                    className="w-20 h-2" 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {allSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Improvement Suggestions</CardTitle>
            <CardDescription>
              Recommendations to boost your ATS score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {allSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
