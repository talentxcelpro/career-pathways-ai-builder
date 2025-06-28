
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain, Star, TrendingUp, Clock, Users } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface AIScreeningResult {
  id: string;
  candidateName: string;
  candidateAvatar?: string;
  jobTitle: string;
  aiScore: number;
  matchPercentage: number;
  strengths: string[];
  concerns: string[];
  recommendation: 'strong_match' | 'good_match' | 'potential_match' | 'weak_match';
  processingTime: string;
}

export const AIScreeningWidget = () => {
  const navigate = useNavigate();
  
  const screeningResults: AIScreeningResult[] = [
    {
      id: '1',
      candidateName: 'Sarah Johnson',
      jobTitle: 'Senior Frontend Developer',
      aiScore: 92,
      matchPercentage: 87,
      strengths: ['React expertise', 'Strong portfolio', 'Team leadership'],
      concerns: ['No TypeScript experience'],
      recommendation: 'strong_match',
      processingTime: '2 mins ago'
    },
    {
      id: '2',
      candidateName: 'Mike Chen',
      jobTitle: 'Product Manager',
      aiScore: 85,
      matchPercentage: 78,
      strengths: ['Strategic thinking', 'Data-driven', 'Startup experience'],
      concerns: ['Limited enterprise experience'],
      recommendation: 'good_match',
      processingTime: '15 mins ago'
    },
    {
      id: '3',
      candidateName: 'Emily Davis',
      jobTitle: 'UX Designer',
      aiScore: 73,
      matchPercentage: 68,
      strengths: ['Creative portfolio', 'User research skills'],
      concerns: ['Limited technical skills', 'Remote work preference'],
      recommendation: 'potential_match',
      processingTime: '1 hour ago'
    }
  ];

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_match': return 'bg-green-100 text-green-700 border-green-200';
      case 'good_match': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'potential_match': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'weak_match': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_match': return 'Strong Match';
      case 'good_match': return 'Good Match';
      case 'potential_match': return 'Potential Match';
      case 'weak_match': return 'Weak Match';
      default: return 'Unknown';
    }
  };

  const averageScore = Math.round(screeningResults.reduce((acc, result) => acc + result.aiScore, 0) / screeningResults.length);

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">AI Screening Results</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                Avg. score: {averageScore}% • {screeningResults.length} candidates processed
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-semibold"
            onClick={() => navigate('/employer/ai/screening')}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {screeningResults.map((result) => (
          <div 
            key={result.id}
            className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/employer/ai/screening/${result.id}`)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={result.candidateAvatar} />
              <AvatarFallback className="text-xs">{result.candidateName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-slate-800">{result.candidateName}</h4>
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-violet-500" />
                    <span className="text-xs font-semibold text-slate-700">{result.aiScore}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {result.jobTitle}
                </Badge>
                <Badge className={`text-xs ${getRecommendationColor(result.recommendation)}`}>
                  {getRecommendationText(result.recommendation)}
                </Badge>
              </div>
              
              <div className="space-y-1 mb-2">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-slate-600">{result.strengths.slice(0, 2).join(', ')}</span>
                </div>
                {result.concerns.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-slate-600">{result.concerns[0]}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-500">Match: {result.matchPercentage}%</span>
                </div>
                <span className="text-xs text-slate-500">{result.processingTime}</span>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <div 
            className="flex items-center justify-center gap-2 p-2 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors cursor-pointer"
            onClick={() => navigate('/employer/ai/screening')}
          >
            <span className="text-sm font-semibold text-violet-700">View AI Insights</span>
            <Brain className="h-3 w-3 text-violet-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
