import React, { useState, useEffect } from 'react';
import { Brain, Target, TrendingUp, Star, MapPin, DollarSign, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  matchReasons: string[];
  urgency: 'low' | 'medium' | 'high';
  postedTime: string;
  skills: string[];
}

interface MatchingInsights {
  profileStrength: number;
  marketDemand: number;
  skillGaps: string[];
  recommendations: string[];
}

export const MobileAIMatching = () => {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [insights, setInsights] = useState<MatchingInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Mock AI matching data
    const mockMatches: JobMatch[] = [
      {
        id: '1',
        title: 'Senior React Developer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        salary: '$120k - $160k',
        matchScore: 95,
        matchReasons: ['React expertise', '5+ years experience', 'TypeScript skills'],
        urgency: 'high',
        postedTime: '2 hours ago',
        skills: ['React', 'TypeScript', 'Node.js']
      },
      {
        id: '2',
        title: 'Frontend Engineer',
        company: 'StartupXYZ',
        location: 'New York, NY',
        salary: '$100k - $140k',
        matchScore: 88,
        matchReasons: ['JavaScript proficiency', 'Modern frameworks', 'Remote work experience'],
        urgency: 'medium',
        postedTime: '1 day ago',
        skills: ['JavaScript', 'Vue.js', 'CSS']
      },
      {
        id: '3',
        title: 'Full Stack Developer',
        company: 'Enterprise Inc',
        location: 'Austin, TX',
        salary: '$90k - $130k',
        matchScore: 82,
        matchReasons: ['Full stack experience', 'API development', 'Database knowledge'],
        urgency: 'low',
        postedTime: '3 days ago',
        skills: ['React', 'Python', 'PostgreSQL']
      }
    ];

    const mockInsights: MatchingInsights = {
      profileStrength: 85,
      marketDemand: 92,
      skillGaps: ['GraphQL', 'Docker', 'AWS'],
      recommendations: [
        'Add GraphQL to your skillset to increase matches by 15%',
        'Consider remote positions to expand opportunities',
        'Update your profile with recent project examples'
      ]
    };

    setMatches(mockMatches);
    setInsights(mockInsights);
  }, []);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    
    toast({
      title: "AI Analysis Complete",
      description: "Your job matches have been updated with new insights",
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">AI Job Matching</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runAIAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Refresh'}
        </Button>
      </div>

      {/* Insights Card */}
      {insights && (
        <Card className="p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Profile Insights
          </h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Profile Strength</span>
                <span className="font-medium">{insights.profileStrength}%</span>
              </div>
              <Progress value={insights.profileStrength} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Market Demand</span>
                <span className="font-medium">{insights.marketDemand}%</span>
              </div>
              <Progress value={insights.marketDemand} className="h-2" />
            </div>

            {insights.skillGaps.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Skill Gaps:</p>
                <div className="flex flex-wrap gap-1">
                  {insights.skillGaps.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">AI Recommendations:</p>
              {insights.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <TrendingUp className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Job Matches */}
      <div className="space-y-3">
        <h3 className="font-medium">Top Matches</h3>
        {matches.map((match) => (
          <Card key={match.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{match.title}</h4>
                  <p className="text-sm text-muted-foreground">{match.company}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className={`h-4 w-4 ${getMatchScoreColor(match.matchScore)}`} />
                  <span className={`text-sm font-bold ${getMatchScoreColor(match.matchScore)}`}>
                    {match.matchScore}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{match.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{match.salary}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className={`h-3 w-3 ${getUrgencyColor(match.urgency)}`} />
                  <span>{match.postedTime}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium">Why it's a match:</p>
                <div className="flex flex-wrap gap-1">
                  {match.matchReasons.map((reason, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {match.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};